drop schema if exists rincon_del_lector;
drop user if exists admin_1;

CREATE SCHEMA rincon_del_lector;

create user 'admin_1'@'%' identified by 'contra_1';
grant all privileges on rincon_del_lector.* to 'admin_1'@'%';
flush privileges;