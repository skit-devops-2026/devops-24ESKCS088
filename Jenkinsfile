pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                bat 'python --version'
            }
        }

        stage('Test') {
            steps {
                bat 'python -m unittest discover -s tests -v'
            }
        }

        stage('Build') {
            steps {
                bat 'echo No build step required for this static HTML CSS JavaScript project'
            }
        }
    }

    post {
        success {
            echo 'Jenkins Pipeline completed successfully.'
        }

        failure {
            echo 'Jenkins Pipeline failed. Check the stage logs.'
        }
    }
}