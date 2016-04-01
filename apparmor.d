mysql 数据目录迁移操作引发的与apparmor.d相关问题

my.conf中修改datadir=/path/to/mysql/data后，需要修改apparmor.d目录下的相应的usr.sbin.mysqld配置文件的配置项。
然后重新启动apparmor和Mysql服务。
service apparmor reload
service mysql start

