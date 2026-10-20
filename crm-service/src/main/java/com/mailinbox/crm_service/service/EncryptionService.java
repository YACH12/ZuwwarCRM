package com.mailinbox.crm_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Service
public class EncryptionService {

    private static final int MIN_KEY_BYTES = 32;

    private final SecretKeySpec secretKey;

    // ENCRYPTION_SECRET doit être une vraie valeur aléatoire d'au moins 32 octets (UTF-8) —
    // un secret manquant ou trop court fait échouer le démarrage plutôt que de chiffrer
    // silencieusement avec une clé faible/prévisible. En dev, application.properties fournit
    // une valeur par défaut pour ne jamais bloquer le démarrage local ; en production,
    // ENCRYPTION_SECRET doit être positionné avec une vraie valeur aléatoire (ex: openssl rand -base64 32).
    public EncryptionService(@Value("${encryption.secret:}") String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "ENCRYPTION_SECRET est manquant. Définissez la variable d'environnement "
                            + "ENCRYPTION_SECRET avec une valeur aléatoire d'au moins 32 octets (UTF-8).");
        }
        byte[] rawBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (rawBytes.length < MIN_KEY_BYTES) {
            throw new IllegalStateException(
                    "ENCRYPTION_SECRET est trop court (" + rawBytes.length + " octets) — "
                            + "il doit faire au moins " + MIN_KEY_BYTES + " octets (UTF-8) une fois encodé. "
                            + "Générez une vraie valeur aléatoire, ex: openssl rand -base64 32");
        }
        byte[] keyBytes = Arrays.copyOf(rawBytes, 32);
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String plainText) {
        try {
            byte[] iv = new byte[12];
            new SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(128, iv));
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Erreur chiffrement SMTP password", e);
        }
    }

    public String decrypt(String encryptedText) {
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedText);
            byte[] iv = Arrays.copyOfRange(combined, 0, 12);
            byte[] cipherText = Arrays.copyOfRange(combined, 12, combined.length);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(128, iv));
            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Valeur non chiffrée (migration depuis ancien format plain text)
            return encryptedText;
        }
    }
}
