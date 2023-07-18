node() {
    withCredentials([string(credentialsId: 'docker_server', variable: 'docker_server')]){
        properties([
            parameters([
                string(name: 'docker_repo', defaultValue: 'samagragovernance/issuance', description: 'Docker Image Name'),
                string(name: 'docker_server', defaultValue: "$docker_server", description: 'Docker Registry URL'),

            ])
        ])
    }
    stage('Checkout') {
            cleanWs()
            checkout scm
            env.commit_id = env.BRANCH_NAME
            echo "${env.commit_id}"
    }

    stage('docker-build') {
        sh '''
        docker build -t $docker_server/$docker_repo:$commit_id .
        '''
        if (env.BRANCH_NAME == 'uat') {
            sh '''
            docker build -t $docker_server/$docker_repo:uat .
            '''
        }
    }

    stage('docker-push') {
        sh '''
        docker push $docker_server/$docker_repo:$commit_id
        '''
        if (env.BRANCH_NAME == 'uat') {
            sh '''
            docker push $docker_server/$docker_repo:uat
                        '''
        }
    }
    
    stage('Start deploy job with latest tag') {
         if (env.BRANCH_NAME == 'uat') { 
                build job: 'UAT/deploy-uat/deploy-issuer', parameters: [string(name: 'tag', value: 'uat')]
         }
}

}