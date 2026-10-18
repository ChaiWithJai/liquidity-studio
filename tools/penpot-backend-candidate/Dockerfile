FROM penpotapp/backend@sha256:2df1b3440d2a82cc3571db211b4ffdfa2b89ccc910759e8d5e9387fb62971b5c
ARG STUDIO_SOURCE
ARG RECIPE_SOURCE
ARG JAR_SHA256
LABEL studio.native.upstream="ff7a66f51938b2293260ea27a64e2c4e0833b5e3" \
      studio.native.source="$STUDIO_SOURCE" \
      studio.native.recipe="$RECIPE_SOURCE" \
      studio.native.jar-sha256="$JAR_SHA256" \
      studio.native.activation="disabled-until-private-configuration-and-acceptance"
COPY --chown=penpot:penpot penpot.jar /opt/penpot/backend/penpot.jar
