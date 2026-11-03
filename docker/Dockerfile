# ---------- Stage 1: build the Cohort Builder app ----------
# package.json requires node >=22
FROM registry.access.redhat.com/ubi9/nodejs-22 AS build

WORKDIR /opt/app-root/src

# Install dependencies first so this layer is cached between builds.
# npm 7+ also installs the peerDependencies (MUI, Emotion) the app needs.
COPY package*.json ./
RUN npm ci

COPY . .

# Type-check, then build only the standalone app into /dist.
# The /lib output (build:lib) is the npm package and isn't served, so it's skipped.
RUN npx tsc -b && npm run build:app

# ---------- Stage 2: serve with Apache ----------
FROM registry.access.redhat.com/ubi9/httpd-24

# Group 0 ownership lets OpenShift's random UID read the files
COPY --from=build /opt/app-root/src/dist/ /var/www/html/

# SPA routing, caching and security headers
COPY httpd/httpd.conf /etc/httpd/conf.d/httpd.conf

CMD ["run-httpd"]