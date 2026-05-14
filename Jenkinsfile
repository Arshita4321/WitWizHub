pipeline {
    agent any

    environment {
        DOCKER_USERNAME = "arshi5583"
    }

    stages {

        stage('Pull Images') {
            steps {
                sh """
                docker pull $DOCKER_USERNAME/witwizhub-backend:latest
                docker pull $DOCKER_USERNAME/witwizhub-frontend:latest
                """
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh """
                docker stop backend || true
                docker rm backend || true

                docker stop frontend || true
                docker rm frontend || true
                """
            }
        }

        stage('Run Containers') {
            steps {
                sh """
                docker run -d -p 5000:5000 --name backend $DOCKER_USERNAME/witwizhub-backend:latest
                docker run -d -p 3000:3000 --name frontend $DOCKER_USERNAME/witwizhub-frontend:latest
                """
            }
        }
    }
}