FROM public.ecr.aws/docker/library/python:3.11-slim

WORKDIR /app

# Copiar requirements.txt
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Exponer puertos
EXPOSE 3000 5173

# Cambiar a directorio src para que los imports funcionen
WORKDIR /app/src

# Ejecutar el backend FastAPI
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]