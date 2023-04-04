# webapp instructor
### This application is built with JavaScript (Node.js + Express.js) and tested with Jest.
## Prerequisites
To use this app. We need to install `Node.js`, `npm` and `MySQL` first.
## Install
```
git clone git@github.com:Changyu-Wu-CSYE6225/webapp.git
npm install
```
## Run Application
```
node server.js
```
or
```
npm start
```
or
```
npm run backend
```
## Test
```
npm test
```
***
## CI/CD (Packer)
Use Packer to create an AMI (This part will be done in Github actions)
```
packer fmt ami.pkr.hcl && packer init ami.pkr.hcl && packer validate -var-file="ami.pkrvars.hcl" ami.pkr.hcl
```
For dev only, before packer build
```
export AWS_PROFILE=dev
packer build -var-file="ami.pkrvars.hcl" ami.pkr.hcl
```
***
## Logger & Metrics
### Dependencies
`Winston` - Create log info

`node-statsd` - Record metrics
***
## Stress Test with JMeter
### Start
```
cd /Applications/apache-jmeter-5.5/bin
sh jmeter.sh
```
