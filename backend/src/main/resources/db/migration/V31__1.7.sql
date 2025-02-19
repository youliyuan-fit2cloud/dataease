CREATE TABLE `dataset_column_permissions` (
   `id`         varchar(64) NOT NULL COMMENT 'File ID',
   `auth_target_type`  varchar(255) DEFAULT NULL COMMENT '权限类型：组织/角色/用户',
   `auth_target_id`    bigint(20) DEFAULT NULL COMMENT '权限对象ID',
   `dataset_id`    varchar(64) DEFAULT NULL COMMENT '数据集ID',
   `permissions`  longtext DEFAULT NULL COMMENT '权限',
   `update_time` bigint(13) NULL DEFAULT NULL,
   PRIMARY KEY (`id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;

INSERT INTO `sys_menu` (`menu_id`, `pid`, `sub_count`, `type`, `title`, `name`, `component`, `menu_sort`, `icon`, `path`, `i_frame`, `cache`, `hidden`, `permission`, `create_by`, `update_by`, `create_time`, `update_time`) VALUES (61, 0, 0, 1, '首页', 'wizard', 'wizard/index', 0, '', '/wizard', b'1', b'0', b'0', NULL, NULL, NULL, NULL, 1614915491036);
INSERT INTO `system_parameter` (`param_key`, `param_value`, `type`, `sort`) VALUES ('ui.openHomePage', 'true', 'boolean', 13);

