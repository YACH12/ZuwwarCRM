<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zuwwar — Connexion</title>
    <link rel="stylesheet" href="${url.resourcesPath}/css/login.css">
</head>
<body>
    <div class="zuwwar-orb zuwwar-orb-a"></div>
    <div class="zuwwar-orb zuwwar-orb-b"></div>

    <div class="zuwwar-card">

        <div class="zuwwar-logo">
            <span class="logo-text">Zuwwar</span>
        </div>

        <p class="zuwwar-subtitle">CRM Intelligent — Connectez-vous</p>

        <#-- Vérification sécurisée du message d'erreur de Keycloak — le libellé
             générique "Invalid username or password." est remplacé par un
             message français cohérent avec le reste du thème. Keycloak fusionne
             volontairement les cas "email inconnu" et "mot de passe erroné" dans
             ce même message, pour ne jamais révéler quel des deux est invalide. -->
        <#if message?? && message?has_content>
            <div class="zuwwar-error">
                <svg class="zuwwar-error-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 15.75h.008v.008H12v-.008z"/>
                </svg>
                <span>
                    <#if message.summary?contains("Invalid username or password")>
                        Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.
                    <#else>
                        ${message.summary?no_esc}
                    </#if>
                </span>
            </div>
        </#if>

        <form class="form_main" action="${url.loginAction}" method="post">

            <div class="inputContainer">
                <svg class="inputIcon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9CA3AF" viewBox="0 0 16 16">
                    <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"/>
                </svg>
                <input class="inputField"
                    type="text"
                    id="username"
                    name="username"
                    value="${(login.username!'')}"
                    placeholder="Email ou nom d'utilisateur"
                    autofocus
                    autocomplete="username"/>
            </div>

            <div class="inputContainer">
                <svg class="inputIcon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9CA3AF" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                </svg>
                <input class="inputField"
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Mot de passe"
                    autocomplete="current-password"/>
            </div>

            <#-- Correction de la syntaxe de l'input hidden pour parer les NullPointerExceptions -->
            <input type="hidden" id="id-hidden-input" name="credentialId" value="${(auth.selectedCredential)!''}"/>

            <#if realm.resetPasswordAllowed>
                <a class="forgotLink" href="${url.loginResetCredentialsUrl}">Mot de passe oublié ?</a>
            </#if>

            <input class="zuwwar-submit"
                type="submit"
                name="login"
                id="kc-login"
                value="Se connecter"/>

        </form>

        <div class="zuwwar-register">
            Pas encore de compte ?
            <a href="http://localhost:4200/signup">Créer un compte</a>
        </div>

        <div class="zuwwar-footer">
            © 2026 Zuwwar — Plateforme CRM Intelligente
        </div>
    </div>
</body>
</html>
