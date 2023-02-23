# webapp instructor

### This application is built with JavaScript (Node.js + Express.js) and tested with Jest.
***

Prerequisites
---
To use this app. We need to install `Node.js`, `npm` and `MySQL` first.
***

Install
---
```
$ git clone git@github.com:Changyu-Wu-CSYE6225/webapp.git
$ npm install
```

Run the protect
---
```
$ node server.js
```
or
```
$ npm start
```
or
```
$ npm run backend
```

Test
---
```
$ npm test
```

---
Use Packer to create an AMI (This part will be done in CI/CD)
```
packer fmt ami.pkr.hcl && packer init ami.pkr.hcl && packer validate ami.pkr.hcl
```
```
packer build ami.pkr.hcl
```