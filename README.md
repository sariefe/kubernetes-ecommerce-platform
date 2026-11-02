# 🛒 Kubernetes E-Commerce Platform

A modern, scalable e-commerce microservices architecture deployed on Kubernetes. This project demonstrates the integration of a React frontend, a Flask backend, and a PostgreSQL database with persistent storage and ingress routing.

## 🏗️ Architecture

The platform consists of three main components:

- **Frontend**: A React-based user interface served by Nginx.
- **Backend**: A Python Flask API for managing products and business logic.
- **Database**: A PostgreSQL instance deployed as a `StatefulSet` for data persistence.

### Tech Stack
- **Frontend**: React, Vite, Nginx
- **Backend**: Python 3.12, Flask, Psycopg3
- **Database**: PostgreSQL 17
- **Infrastructure**: Kubernetes, Nginx Ingress Controller

---

## 🚀 Getting Started

### Prerequisites
- A running Kubernetes cluster (Minikube, Kind, or Cloud provider).
- `kubectl` installed and configured.
- A container registry or local image support (e.g., Minikube's internal docker daemon).
- Nginx Ingress Controller installed in your cluster.

### 🛠️ Installation & Deployment

#### 1. Build and Push Images
Build the backend and frontend images and push them to your registry:

```bash
# Backend
docker build -t ecommerce-backend:1.0 ./app/backend

# Frontend
docker build -t ecommerce-frontend:1.0 ./app/frontend
```

#### 2. Deploy to Kubernetes
Apply the manifests in the following order:

```bash
# Create Namespace
kubectl apply -f kubernetes/namespace.yaml

# Setup Secrets and Configs
kubectl apply -f kubernetes/secrets/
kubectl apply -f kubernetes/configmaps/

# Setup Storage and Database
kubectl apply -f kubernetes/storage/
kubectl apply -f kubernetes/services/postgres-service.yaml
kubectl apply -f kubernetes/services/postgres-headless.yaml
kubectl apply -f kubernetes/deployments/postgres-statefulset.yaml

# Deploy Backend and Frontend
kubectl apply -f kubernetes/deployments/backend-deployment.yaml
kubectl apply -f kubernetes/services/backend-service.yaml
kubectl apply -f kubernetes/deployments/frontend-deployment.yaml
kubectl apply -f kubernetes/deployments/frontend-service.yaml

# Configure Ingress
kubectl apply -f kubernetes/ingress/ecommerce-ingress.yaml
```

---

## 🌐 Accessing the Platform

The platform is configured to be accessible via the host `ecommerce.local`.

1. **Update your hosts file**:
   Add the following line to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
   ```text
   <INGRESS_CONTROLLER_IP> ecommerce.local
   ```

2. **Open in Browser**:
   - Frontend: `http://ecommerce.local`
   - Backend API Health: `http://ecommerce.local/api/health`
   - Product List: `http://ecommerce.local/api/products`

---

## 📁 Project Structure

```text
.
├── app/
│   ├── backend/        # Flask API source code & Dockerfile
│   └── frontend/       # React UI source code & Dockerfile
├── kubernetes/         # K8s Manifests
│   ├── configmaps/     # App configurations
│   ├── deployments/    # Deployment & StatefulSet specs
│   ├── ingress/        # Nginx Ingress rules
│   ├── secrets/        # Sensitive data (DB credentials)
│   ├── services/       # ClusterIP & Headless services
│   └── storage/        # PVC definitions for Postgres
└── README.md
```

## 🛠️ Maintenance

**Updating Frontend Config**:
The frontend configuration is managed via a ConfigMap. To update Nginx settings:
1. Edit `kubernetes/configmaps/frontend-nginx-conf.yaml`.
2. Apply: `kubectl apply -f kubernetes/configmaps/frontend-nginx-conf.yaml`.
3. Restart: `kubectl rollout restart deployment frontend -n ecommerce`.
