# Usa una imagen base de Node.js
FROM node:14

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia todo el código de la aplicación (incluyendo la carpeta public)
COPY . .

# **Crear el subdirectorio uploads**
RUN mkdir -p /usr/src/app/public/uploads


# Expone el puerto en el que escucha la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD [ "npm", "start" ]


