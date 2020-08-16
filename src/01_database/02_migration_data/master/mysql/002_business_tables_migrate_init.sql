CREATE TABLE IF NOT EXISTS `bizDeliveryZone` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `Kind` smallint(6) NOT NULL DEFAULT '0' COMMENT '0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route',
  `Name` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of Delivery Zone',
  `DistanceUnit` smallint(6) NOT NULL DEFAULT '0' COMMENT '0 = Miles, 1 = Kilometers',
  `DistanceCalcKind` smallint(6)  NOT NULL DEFAULT '0' COMMENT 'Algoritm to use to calculate the delivery price',
  `DistanceBase` decimal(10,2)  NOT NULL DEFAULT '4.00' COMMENT 'Base distance of delivery. Before to start to bill extra miles',
  `DistanceMax` decimal(10,2)  NOT NULL DEFAULT '10.00' COMMENT 'Maximun distance of delivery',
  `DistanceExtraCalcKind` smallint(6)  NOT NULL DEFAULT '0' COMMENT 'Algoritm to use to calculate the extra distance delivery price',
  `DistanceExtraByUnit` decimal(10,2)  NOT NULL DEFAULT '1.66' COMMENT 'Price for aditional distance unit',
  `DeliveryByDriverMax` smallint(6) NOT NULL DEFAULT '3' COMMENT 'Maximun ammount of delivery by driver',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UNQ_bizDeliveryZone_Name_UNIQUE_idx` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores delivery zone and rules.';

CREATE TABLE IF NOT EXISTS `bizEstablishment` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `DeliveryZoneId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Delivery zone associated with the Establisment.',
  `Kind` smallint(6) NOT NULL DEFAULT '0' COMMENT '0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route',
  `Name` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of establishment',
  `Address` varchar(512) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Physical address of establishment',
  `Latitude` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Latitude coordinate.',
  `Longitude` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Longitude coordinate.',
  `EMail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Email of establisment',
  `Phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Phone of establisment',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UNQ_bizEstablishment_Name_UNIQUE_idx` (`Name`),
  KEY `FK_bizEstablishment_DeliveryZoneId_From_bizDeliveryZone_Id_idx` (`DeliveryZoneId`),
  CONSTRAINT `FK_bizEstablishment_DeliveryZoneId_From_bizDeliveryZone_Id` FOREIGN KEY (`DeliveryZoneId`) REFERENCES `bizDeliveryZone` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores establishment.';

CREATE TABLE IF NOT EXISTS `bizDestination` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `UserId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table sysUser',
  `EstablishmentId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table bizEstablisment',
  `Address` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Physical address',
  `Latitude` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Latitude coordinate.',
  `Longitude` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Longitude coordinate.',
  `Name` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of customer/establisment',
  `EMail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Email of customer/establisment',
  `Phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Phone of customer/establisment',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_bizDestination_UserId_From_bizUser_Id_idx` (`UserId`),
  KEY `FK_bizDestination_EstablishmentId_From_bizEstablishment_Id_idx` (`EstablishmentId`),
  CONSTRAINT `FK_bizDestination_UserId_From_bizUser_Id` FOREIGN KEY (`UserId`) REFERENCES `sysUser` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_bizDestination_EstaId_From_bizEstablishment_Id` FOREIGN KEY (`EstablishmentId`) REFERENCES `bizEstablishment` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of destination point.';

CREATE TABLE IF NOT EXISTS `bizDriverRoute` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `StartAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Date and time. Can be in the future by the case of Driver by Route.',
  `UserId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUser on field Id',
  `Name` varchar(75) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of route',
  `RoutePrioritySort` smallint(6) COLLATE utf8_unicode_ci NOT NULL COMMENT '0 = Manual, 1 = More close first, 2 = More far away first, 3 = Less time first, 4 = More time first',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Lock tag allow to change the priority sort, #Allow_Sort:0,1,2,3,4# allow to driver to sort in the number',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_bizDeliveryOrderDriverRoute_UserId_From_sysUser_Id_idx` (`UserId`),
  CONSTRAINT `FK_bizDeliveryOrderDriverRoute_UserId_From_sysUser_Id` FOREIGN KEY (`UserId`) REFERENCES `sysUser` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store information about the route of driver.';

CREATE TABLE IF NOT EXISTS `bizDeliveryOrder` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `Kind` smallint(6) NOT NULL COMMENT '0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route',
  `DriverRouteId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table bizDriverRoute on field Id',
  `DeliveryAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Indicate the date and time to made the delivery. Can be diferent/future of CreatedAt',
  `OriginId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table bizOrigin on field Id',
  `DestinationId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table bizDestination on field Id',
  `UserId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table sysUser on field Id',
  `StatusCode` smallint(6) NOT NULL DEFAULT '0' COMMENT 'Last status code of delivery',
  `StatusDescription` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Last status text description of the order',
  `RoutePriority` smallint(6) NOT NULL COMMENT 'Delivery route priority from minor to mayor',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `CanceledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user canceled the order',
  `CanceledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Canceled Date and time of the order.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_bizDeliveryOrder_DriverRouteId_From_bizDriverRoute_Id_idx` (`DriverRouteId`),
  KEY `FK_bizDeliveryOrder_OriginId_From_bizOrigin_Id_idx` (`OriginId`),
  KEY `FK_bizDeliveryOrder_DestinationId_From_bizDestination_Id_idx` (`DestinationId`),
  KEY `FK_bizDeliveryOrder_UserId_From_bizDestination_Id_idx` (`UserId`),
  CONSTRAINT `FK_bizDeliveryOrder_DriverRouteId_From_bizDriverRoute_Id` FOREIGN KEY (`DriverRouteId`) REFERENCES `bizDriverRoute` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_bizDeliveryOrder_OriginId_From_bizOrigin_Id` FOREIGN KEY (`OriginId`) REFERENCES `bizOrigin` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_bizDeliveryOrder_DestinationId_From_bizDestination_Id` FOREIGN KEY (`DestinationId`) REFERENCES `bizDestination` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_bizDeliveryOrder_UserId_From_sysUser_Id` FOREIGN KEY (`UserId`) REFERENCES `sysUser` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of delivery.';

CREATE TABLE IF NOT EXISTS `bizDeliveryOrderStatus` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `DeliveryOrderId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table bizDelivery on field Id',
  `Code` smallint(6) NOT NULL DEFAULT '0' COMMENT 'Status code of delivery',
  `Description` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Status text description of the delivery',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_bizDeliveryOrdStatus_DeliveryId_From_bizDeliveryOrder_Id_idx` (`DeliveryOrderId`),
  CONSTRAINT `FK_bizDeliveryOrdStatus_DeliveryOrderId_From_bizDeliveryOrder_Id` FOREIGN KEY (`DeliveryOrderId`) REFERENCES `bizDeliveryOrder` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the delivery status.';

CREATE TABLE IF NOT EXISTS `bizDeliveryOrderStatusStep` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `Kind` smallint(6) NOT NULL COMMENT '0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route',
  `Sequence` smallint(6) NOT NULL COMMENT 'Number to indicate the next and previous step. 0, 1, 2, 3, 4',
  `First` smallint(6) NOT NULL COMMENT '0 = Is not the first step, 1 = Is the last step',
  `Last` smallint(6) NOT NULL COMMENT '0 = Is not the last step, 1 = Is the last step',
  `Canceled` smallint(6) NOT NULL COMMENT '0 = This status indicate a NOT canceled order, 1 = This status indicate a Canceled order',
  `Code` smallint(6) NOT NULL COMMENT 'Status code to be used/copied in table byzDeliveryOrderStatus field Code and table bizDeliveryOrder field StatusCode',
  `Description` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Status text description to be used/copied to table bizDeliveryOrderStatus field StatusDescription and table bizDeliveryOrder field StatusDescription',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the reference to sequences of step for every kind of delivery order.';

CREATE TABLE IF NOT EXISTS `bizEstablishmentInUserGroup` (
  `UserGroupId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUserGroup',
  `EstablishmentId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table bizEstablishment',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`UserGroupId`,`EstablishmentId`),
  KEY `FK_bizEstaInUserGroup_UserGroupId_From_sysUserGroup_Id_idx` (`UserGroupId`),
  KEY `FK_bizEstaInUserGroup_EstaId_From_bizEstablishment_Id_idx` (`EstablishmentId`),
  CONSTRAINT `FK_bizEstaInUserGroup_UserGroupId_From_sysUserGroup_Id` FOREIGN KEY (`UserGroupId`) REFERENCES `sysUserGroup` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_bizEstaInUserGroup_EstablishmentId_From_bizEstablishment_Id` FOREIGN KEY (`EstablishmentId`) REFERENCES `bizEstablishment` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of stablisment and user group.';

CREATE TABLE IF NOT EXISTS `bizDriverInDeliveryZone` (
  `DeliveryZoneId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table bizDeliveryZone',
  `UserId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUser',
  `StartAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'When start date and time to work in the delivery zone',
  `EndAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'When end date and time from work in the delivery zone',
  `ShortToken` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUserSessionStatus on field ShortToken',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Help when allow (LockTag === #Driver#) ot not (LockTag !== #Driver#) to driver to change the delivery zone by your self.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`DeliveryZoneId`,`UserId`,`StartAt`),
  KEY `FK_bizDriInDeliveryZone_UserId_From_sysUser_Id_idx` (`UserId`),
  KEY `FK_bizDriInDeliveryZone_DZoneId_From_bizDeliveryZone_Id_idx` (`DeliveryZoneId`),
  CONSTRAINT `FK_bizDriInDeliveryZone_DeliveryZoneId_From_bizDeliveryZone_Id` FOREIGN KEY (`DeliveryZoneId`) REFERENCES `bizDeliveryZone` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_bizDriInDeliveryZone_UserId_From_sysUser_Id` FOREIGN KEY (`UserId`) REFERENCES `sysUser` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of driver delivery zone.';

CREATE TABLE IF NOT EXISTS `bizDriverPosition` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `UserId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUser',
  `ShortToken` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUserSessionStatus on field ShortToken. No Database foreign key cascade update or delete',
  `Accuracy` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Accuracy parameter.',
  `Latitude` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Latitude coordinate.',
  `Longitude` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Longitude coordinate.',
  `Altitude` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Altitude position.',
  `Speed` varchar(40) COLLATE utf8_unicode_ci NOT NULL  COMMENT 'Speed of movement',
  `Code` smallint NOT NULL COMMENT '0 = offline. Data/Wifi off saved to local mobile database in the device and later uploaded to backend, 1 = online. Full data connectivity send to backend immediately',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_bizDriverPosition_UserId_From_bizEstablishment_Id_idx` (`UserId`),
  KEY `FK_bizDriverPosition_Token_From_sysUserSessionStatus_Token_idx` (`ShortToken`),
  CONSTRAINT `FK_bizDriverPosition_UserId_From_sysUser_Id` FOREIGN KEY (`UserId`) REFERENCES `sysUser` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of driver position.';
