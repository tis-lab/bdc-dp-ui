# Migrating This Repository to a New Environment

This guide describes how to move this repository to another environment.

## ⚠️ Do not migrate these folders

The following folders are **environment-specific** and must **not** be copied to the target environment:

| Folder      | Why it is excluded                                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/`  | CI workflows are tied to the current environment.                                                                                                     |
| `docker/`   | Container definitions, images, and volumes are built for the current infrastructure.                                                                  |
| `httpd/`    | Apache web server configuration is specific to the current host.                                                                                      |
| `src/theme` | MUI theme configuration for testing in the current environment. The target environment should be pulling theme configuration from the shared library. |

The target environment is expected to provide its own equivalents of these.

> These exclusions apply to the folders at the **repository root** only. Folders with the same name deeper in the tree are migrated normally unless stated otherwise.
