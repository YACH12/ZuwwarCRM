package com.mailinbox.crm_service.security;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.User;

/**
 * Représente l'appelant authentifié courant : soit un membre du staff interne
 * (accès global, cross-tenant), soit un Client (accès restreint à ses propres données).
 */
public record CurrentPrincipal(User staffUser, Client client) {

    public static CurrentPrincipal staff(User u) {
        return new CurrentPrincipal(u, null);
    }

    public static CurrentPrincipal client(Client c) {
        return new CurrentPrincipal(null, c);
    }

    public boolean isStaff() {
        return staffUser != null;
    }

    public boolean isClient() {
        return client != null;
    }

    /** null pour le staff (accès global), id du tenant pour un Client. */
    public Long tenantIdOrNull() {
        return isClient() ? client.getId() : null;
    }
}
