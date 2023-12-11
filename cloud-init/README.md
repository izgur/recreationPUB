# DevOps akademija - Web development

# Cloud-init RecreationApp (Igor Žgur)
- forward http://localhost:3000 to port 80
- restart of nginx
- install nodejs
- clone git repository (private or public)
- create .env file
- install npm
- install angular
- npm install for backend
- npm install for frontend(angular)
- install leafletjs for angular
- build angular app into build directory
- create systemd file (recreationapp.service) and start the service
- print status of recreationapp.service

## recreationapp-public-user-data.txt (public)
- for public github repository: https://github.com/izgur/recreationPUB

## recreationapp-private-user-data.txt (private
- for private github repository: https://github.com/izgur/recreationPrivate


# Start script and check basics
ssh ubuntu@essa-vm-13.lrk.si (essavaje)
ubuntu@essa-vm-13:~$ nano /tmp/recreationapp-public-user-data
ubuntu@essa-vm-13:~$ lxc launch ubuntu:focal privat --config=user.user-data="$(cat /tmp/recreationapp-public-user-data)"
Creating privat
Starting privat
ubuntu@essa-vm-13:~$ lxc shell privat
root@privat:~# tail -f /var/log/cloud-init.log /var/log/cloud-init-output.log
root@privat:~# systemctl status recreationapp.service
root@privat:~# sudo lsof -nP | grep LISTEN
root@privat:~# wget localhost
root@privat:~# exit
ubuntu@essa-vm-13:~$ lxc stop privat
ubuntu@essa-vm-13:~$ lxc rm privat

# Useful Commands
tail -f /var/log/cloud-init.log /var/log/cloud-init-output.log 
touch /etc/systemd/system/recreationapp.service
nano /etc/systemd/system/recreationapp.service
nano /home/recreationapp.log
nano /home/recreationapp-error.log
systemctl start recreationapp.service
systemctl status recreationapp.service
sudo lsof -nP | grep LISTEN
systemctl stop recreationapp.service 
systemctl enable recreationapp.service 
systemctl daemon-reload
systemctl disable recreationapp.service 



