pipeline {
    agent any

    environment {
        DOCKERHUB = credentials('dockerhub-creds')

        BACKEND_IMAGE  = "${DOCKERHUB_USR}/witwizhub-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USR}/witwizhub-frontend"
    }

    stages {

        stage('Update Backend Image') {
            steps {
                sh """
                    kubectl set image deployment/witwizhub-backend \
                    backend=${BACKEND_IMAGE}:latest \
                    --record
                """
            }
        }

        stage('Update Frontend Image') {
            steps {
                sh """
                    kubectl set image deployment/witwizhub-frontend \
                    frontend=${FRONTEND_IMAGE}:latest \
                    --record
                """
            }
        }

        stage('Verify Rollout') {
            steps {
                sh 'kubectl rollout status deployment/witwizhub-backend'
                sh 'kubectl rollout status deployment/witwizhub-frontend'
            }
        }
    }

    post {
        failure {
            sh 'kubectl rollout undo deployment/witwizhub-backend'
            sh 'kubectl rollout undo deployment/witwizhub-frontend'
            echo "Rollout failed — rolled back automatically"
        }

        success {
            echo "Deployment successful — Build ${BUILD_NUMBER}"
        }
    }
}