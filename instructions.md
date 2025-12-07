# Subbuteo Game Controls

## How to Play

This game simulates traditional Subbuteo table football using finger-flicking physics. Control your players by dragging and releasing to flick them toward the ball.

---

## Flicking a Player

### Basic Controls

1. **Position your pointer** behind the player (the side facing away from the goal)
2. **Click and drag** in the direction you want to flick
3. **Release** to apply the flick

The player will move in the direction of your drag motion. Drag further for a stronger flick!

### Flick Zone

- A **blue semi-circular ring** appears behind the player showing the valid flick area
- You must start your drag within this zone (up to 1.5 units behind the player)
- The ring turns **green** and brighter when you're actively dragging
- The ring turns **gray** during the 500ms cooldown between flicks

### Visual Feedback

While dragging, you'll see:
- A **white line** from your drag start point to current position
- A **direction arrow** at the player showing where they'll go:
  - **Orange/Yellow** = weak flick
  - **Red** = strong flick

---

## Flick Strength

| Drag Distance | Result |
|---------------|--------|
| Very short | No flick (minimum threshold not met) |
| Short | Gentle tap for precise positioning |
| Medium | Standard flick |
| Long | Powerful shot (force capped at maximum) |

A small upward force is automatically added for natural movement.

---

## Camera Controls

- **Click and drag** on empty space to rotate the camera around the pitch
- Camera stays focused on the play area
- Zoom is constrained to keep the game visible

---

## Reset

Click the **Reset** button in the bottom-right corner to restart the game and return all pieces to their starting positions.

---

## Tips

- Aim for the ball by flicking your player in line with it
- Use gentle flicks for positioning, strong flicks for shots
- Wait for the cooldown (gray ring) before attempting another flick
- The physics include friction and damping, so players will slow down naturally

---

## Deploying to Azure Static Web Apps

### Prerequisites

- An Azure account ([create free account](https://azure.microsoft.com/free/))
- A GitHub account with this repository

### Step 1: Create Azure Static Web App Resource

1. Go to the [Azure Portal](https://portal.azure.com)
2. Click **Create a resource**
3. Search for **Static Web App** and select it
4. Click **Create**
5. Fill in the details:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or select existing
   - **Name**: Choose a unique name (e.g., `subbuteo-game`)
   - **Plan type**: Free (for hobby projects) or Standard
   - **Region**: Select the closest region to your users
6. Under **Deployment details**:
   - **Source**: Select **GitHub**
   - Click **Sign in with GitHub** and authorize Azure
   - **Organization**: Select your GitHub username/org
   - **Repository**: Select this repository
   - **Branch**: `main`
7. Under **Build Details**:
   - **Build Presets**: Select **React**
   - **App location**: `/`
   - **Api location**: Leave empty
   - **Output location**: `dist`
8. Click **Review + create**, then **Create**

### Step 2: Get the Deployment Token

Azure automatically creates a GitHub Actions workflow, but since we have our own, you need to:

1. After the resource is created, go to your Static Web App in Azure Portal
2. In the left menu, click **Manage deployment token**
3. Click **Copy** to copy the token

### Step 3: Add the Secret to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: Paste the deployment token from Step 2
6. Click **Add secret**

### Step 4: Deploy

The pipeline triggers automatically on:
- Push to `main` branch
- Pull requests to `main` branch

To manually trigger:
1. Go to **Actions** tab in GitHub
2. Select **Azure Static Web Apps CI/CD**
3. Click **Run workflow**

### Viewing Your Deployed App

After deployment completes:
1. Go to your Static Web App in Azure Portal
2. Find the **URL** on the Overview page (e.g., `https://your-app-name.azurestaticapps.net`)
3. Click to open your live game!

### Pull Request Previews

When you open a PR against `main`:
- Azure automatically creates a preview environment
- The preview URL is posted as a comment on the PR
- The preview is deleted when the PR is closed

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check the Actions tab for error logs. Usually a missing dependency. |
| 404 on routes | Add `staticwebapp.config.json` with navigation fallback (SPA routing). |
| Deployment token invalid | Regenerate token in Azure Portal and update GitHub secret. |
