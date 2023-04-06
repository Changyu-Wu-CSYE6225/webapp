#!/bin/bash
sudo yum update -y

# install node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install 16.17.1
# node -e "console.log('Running Node.js ' + process.version)"

# install mysql client (for demo purpose)
sudo yum install mysql -y
# Locally install mysql, setup root password, create database
# sudo yum install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm -y
# sudo yum install mysql-community-server -y
# sudo systemctl daemon-reload
# sudo systemctl enable mysqld
# sudo systemctl start mysqld
# temp_password=$(sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')
# new_password=abcd
# sudo mysql --connect-expired-password -u root -p"$temp_password" << EOF
# ALTER USER 'root'@'localhost' IDENTIFIED BY '$new_password';
# FLUSH PRIVILEGES;
# EOF
# mysql -u root -p"$new_password" -e "CREATE DATABASE csye6225webapp;"

# Update permission and file ownership
unzip /home/ec2-user/webapp.zip -d /home/ec2-user/webapp
rm -rf /home/ec2-user/webapp.zip
chown -R ec2-user:ec2-user /home/ec2-user/webapp
chmod -R 775 /home/ec2-user/webapp

# Install dependencies
cd /home/ec2-user/webapp/ || exit
npm install

# Install Cloudwatch agent
sudo yum install amazon-cloudwatch-agent -y
# Config Cloudwatch agent
# Amazon-cloudwatch-agent is enabled automatically by ec2 instance
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ec2-user/webapp/autorun/cloudwatch_config.json -s

# Set up autorun using Systemd
sudo cp /home/ec2-user/webapp/autorun/webapp.service /etc/systemd/system/webapp.service
sudo systemctl daemon-reload
sudo systemctl enable webapp.service
