# Identity Service UI Design

## Overview
This folder contains the UI design for the Identity Service module in the DRCP frontend web application.

The design was created using Google Stitch.

## Project Context
DRCP frontend is a web application used for disaster response coordination.  
The frontend uses Keycloak for authentication and role-based access control.

## Purpose of Identity Service
The Identity Service handles user identity, authentication, user profile, roles, and access permissions.

## Screens Designed
1. Login Screen
2. User Profile Screen
3. User Management Screen
4. Roles and Access Control Screen
5. Access Denied Screen

## User Roles

### ADMIN
- Full access to the system
- Can manage users
- Can edit user roles
- Can disable users

### COORDINATOR
- Can manage incident-related users
- Can view assigned responders
- Has limited access compared to ADMIN

### RESPONDER
- Can view own profile
- Can access assigned field tasks
- Cannot manage users or roles

## Design Theme
The UI design uses a blue and white theme.

The design includes:
- Sidebar navigation
- User profile section
- User management table
- Role permission cards
- Status badges
- Access denied page

## Design Tool
Google Stitch was used to generate the UI design.
