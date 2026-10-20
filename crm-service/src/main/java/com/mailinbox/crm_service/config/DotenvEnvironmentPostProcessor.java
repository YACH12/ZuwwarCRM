package com.mailinbox.crm_service.config;

import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String DOTENV_FILENAME = ".env";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path dotenvPath = Path.of(DOTENV_FILENAME);
        if (!Files.isRegularFile(dotenvPath)) {
            return;
        }

        Map<String, Object> valeurs = new LinkedHashMap<>();
        try {
            List<String> lignes = Files.readAllLines(dotenvPath);
            for (String ligne : lignes) {
                String texte = ligne.strip();
                if (texte.isEmpty() || texte.startsWith("#")) {
                    continue;
                }
                int separateur = texte.indexOf('=');
                if (separateur < 0) {
                    continue;
                }
                String cle = texte.substring(0, separateur).strip();
                String valeur = demystifier(texte.substring(separateur + 1).strip());
                valeurs.put(cle, valeur);
            }
        } catch (IOException e) {
            return;
        }

        if (!valeurs.isEmpty()) {
            environment.getPropertySources().addLast(new MapPropertySource("dotenv", valeurs));
        }
    }

    private String demystifier(String valeur) {
        if (valeur.length() >= 2
                && ((valeur.startsWith("\"") && valeur.endsWith("\""))
                    || (valeur.startsWith("'") && valeur.endsWith("'")))) {
            return valeur.substring(1, valeur.length() - 1);
        }
        return valeur;
    }
}
