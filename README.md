# Proyecto Kubernetes Helm - Aplicación de Tareas

Este proyecto despliega una aplicación Node.js conectada a una base de datos MySQL utilizando Helm y Kubernetes. La aplicación permite gestionar una lista de tareas diarias a través de un calendario y soporta operaciones CRUD (Crear, Leer, Buscar) para los usuarios y sus respectivas tareas.

### Requisitos
Antes de empezar, asegúrate de tener los siguientes elementos instalados:

- [Minikube](https://minikube.sigs.k8s.io/docs/start/) (v1.34.0 o superior)
- [Helm](https://helm.sh/docs/intro/install/) (v3 o superior)
- [Docker](https://docs.docker.com/get-docker/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Acceso a un clúster Kubernetes funcional (Minikube es suficiente para este caso).

### Configuración de Docker
1. Asegúrate de tener la imagen de Docker correcta de la aplicación Node.js en tu registro de Docker Hub o Docker local.
   ```bash
   docker build -t miltonrpg/mi-app-nodejs:latest .
   docker push miltonrpg/mi-app-nodejs:latest

### Despliegue con Helm
Sigue los pasos a continuación para desplegar la aplicación y la base de datos en tu clúster Kubernetes utilizando Helm.

1. Clona este repositorio:
   ```bash
   git clone https://github.com/MiltonRPG/proyectoclusterhelm.git
   cd proyectoclusterhelm   

2. Modifica el archivo values.yaml para adaptarlo a tus necesidades. Aquí puedes ajustar valores como el nombre de la imagen de Docker, configuraciones de la base de datos, y más.

3. Instala el chart de Helm:

helm upgrade --install proyectoclusterhelm ./proyectoclusterhelm

4. Verifica que los pods y servicios estén corriendo:

kubectl get pods
kubectl get svc

5. Port Forwarding: Si estás usando Minikube o no tienes Ingress configurado, deberás usar port-forward para acceder a la aplicación desde tu máquina local:
kubectl port-forward svc/proyectoclusterhelm 8080:80

Para acceder a la aplicación, asegúrate de tener el DNS o la IP configurados correctamente en tu archivo /etc/hosts (por ejemplo, 192.168.49.2 micalendario).

6. **Autoscaling y Resiliencia**
El chart de Helm está configurado para:
- **Escalar automáticamente** cuando el uso de CPU supere el 70%. El número mínimo de réplicas es 2, y el máximo es 3. Puedes ajustar estos valores en `values.yaml`.
- **Resiliencia**: La aplicación se reiniciará automáticamente si encuentra fallos, utilizando los `livenessProbe` y `readinessProbe` definidos en el archivo de despliegue (`deployment.yaml`).

7. Configuración Sensible

Los secretos como las credenciales de la base de datos se almacenan de forma segura en Kubernetes utilizando `Secrets`. El chart de Helm asocia estos secretos a variables de entorno necesarias para la aplicación.

Para modificar los secretos de la base de datos, puedes ejecutar el siguiente comando:

kubectl create secret generic mysql-secret \
  --from-literal=dbHost=mysql \
  --from-literal=dbPort=3306 \
  --from-literal=dbUser=kubernetes \
  --from-literal=dbPassword=kubernetes \
  --from-literal=dbName=proyecto_kubernetes

8. Pruebas

Puedes verificar que la aplicación y su conexión con la base de datos funcionan correctamente accediendo a las rutas expuestas. La app tiene una interfaz en donde puedes registrar usuarios, agregarles tareas o consultar sus tareas mediante su id. 

IMPORTANTE: Actualmente los IDs utilizados son los internos incrementales de la base de datos y no el identificador del usuario. Por lo que los usuarios agregados seran sus ids, 1,2,3 en orden incremental. 

Para generar tráfico de prueba y activar el escalado automático, puedes utilizar herramientas de carga como Apache Benchmark (ab):
ab -n 1000 -c 10 http://micalendario/ (o el dominio que decidas activar)

Para comprobar que, al eliminar un pod, Kubernetes crea automáticamente otro (resiliencia y autorrecuperación del Deployment), puedes usar el siguiente comando para eliminar un pod específico y luego observar cómo Kubernetes lo recrea automáticamente.

Primero, obtén el nombre de los pods en ejecución:
kubectl get pods

Elimina uno de los pods manualmente utilizando su nombre:

kubectl delete pod <nombre-del-pod>
Por ejemplo:
kubectl delete pod proyectoclusterhelm-648978b696-ljh67

Verifica que Kubernetes cree automáticamente un nuevo pod en su lugar:
kubectl get pods -w

La opción -w de kubectl get pods te permite observar los cambios en tiempo real. Verás cómo Kubernetes reemplaza el pod eliminado con uno nuevo automáticamente.

9. Limpieza del Entorno
Para eliminar todos los recursos creados, puedes ejecutar el siguiente comando:
helm uninstall proyectoclusterhelm

10. Contribuciones y Licencia
Si deseas contribuir a este proyecto, por favor abre un issue o envía un pull request.
