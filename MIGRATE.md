# Migrating This Repository to a New Environment

This guide describes how to move this repository to another environment.

## ⚠️ What gets migrated

Every part of the repository falls into one of three groups:

1. **Migrate entirely:** the contents of `src/`, **except `src/theme/`**.
2. **Never migrate:** the folders listed in the table below.
3. **Review individually:** every file at the repository root. Each one is either migrated entirely, partially merged into the target's existing version, or not migrated. (See step 3.)

| Never migrate | Why it is excluded                                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/`    | CI workflows are tied to the current environment.                                                                                                                    |
| `docker/`     | Container definitions, images, and volumes are built for the current infrastructure.                                                                                 |
| `httpd/`      | Apache web server configuration is specific to the current host.                                                                                                     |
| `src/theme`   | MThe local MUI theme is only for checking styling in the current environment. The target environment uses the shared theme from `@nhlbi/bdcp-frontend` (see step 2). |

The target environment is expected to provide its own equivalents of these.

> These exclusions apply to the folders at the **repository root** only. Folders with the same name deeper in the tree are migrated normally unless stated otherwise.

## Migration steps

### 1. Copy `src/` (without `src/theme/`) to the target environment

### 2. Update `main.tsx` to use the shared theme

In the current environment, `main.tsx` uses a local MUI theme so styling can be checked here. In the target environment, the theme must come from the `@nhlbi/bdcp-frontend` package instead.

Make sure `@nhlbi/bdcp-frontend` is installed in the target environment first:

```bash
npm install --save-dev @nhlbi/bdcp-frontend
```

**Replace this line:**

```tsx
import theme from "./theme/MuiTheme";
```

**With this line:**

```tsx
import { muiTheme as theme } from "@nhlbi/bdcp-frontend";
```

### 3. Review root-level files individually

Files at the repository root must be checked on its own and given one of three decisions:

- **Migrate entirely:** the target has no version of this file, or ours should replace it.
- **Partial merge:** the target has its own version, and only specific parts of ours are needed (for example, a missing dependency in `package.json` or a path alias in `tsconfig.json`). Copy only those parts; never overwrite the target's file.
- **Do not migrate:** the file is specific to the current environment.
