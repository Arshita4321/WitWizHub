pipeline {
    agent any

    environment {
        DOCKER_HUB = "arshi5583"
        BACKEND_IMAGE = "${DOCKER_HUB}/witwizhub-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB}/witwizhub-frontend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    bat "docker build -t %BACKEND_IMAGE%:latest ."
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    bat "docker build -t %FRONTEND_IMAGE%:latest ."
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat "echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin"
                }
            }
        }

        stage('Push Images') {
            steps {
                bat "docker push %BACKEND_IMAGE%:latest"
                bat "docker push %FRONTEND_IMAGE%:latest"
            }
        }
    }

    post {
        always {
            bat "docker logout"
        }
    }
}