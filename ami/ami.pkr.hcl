packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.2"
      source  = "github.com/hashicorp/amazon"
    }
  }
}


variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-0dfcb1ef8550277af"
}

variable "ssh_username" {
  type    = string
  default = "ec2-user"
}

// variable "access_key" {
//   type = string
// }

// variable "secret_access_key" {
//   type = string
// }

variable "ami_users" {
  type = list(string)
  default = [
    "985814182959",
    "005613189821",
  ]
}


source "amazon-ebs" "web_app" {
  ami_name      = "csye6225_{{timestamp}}"
  instance_type = "t2.micro"
  region        = var.aws_region
  source_ami    = var.source_ami
  ssh_username  = var.ssh_username
  ami_users     = var.ami_users

  //   access_key = var.access_key
  //   secret_key = var.secret_access_key


  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/sdh"
    volume_size           = 50
    volume_type           = "gp2"
  }

  aws_polling {
    delay_seconds = 40
    max_attempts  = 5
  }

}


build {
  sources = ["source.amazon-ebs.web_app"]

  provisioner "file" {
    source      = "./webapp.zip"
    destination = "/home/ec2-user/webapp.zip"
  }

  provisioner "shell" {
    scripts = [
      "./ami/setup.sh",
    ]
  }
}