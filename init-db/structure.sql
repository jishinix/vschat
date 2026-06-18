-- visualstudiochat.Chats definition

CREATE TABLE `Chats` (
  `Id` varchar(73) NOT NULL,
  `Type` int NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- visualstudiochat.EncryptedContent definition

CREATE TABLE `EncryptedContent` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Content` text NOT NULL,
  `Fingerprint` varchar(8) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=436 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- visualstudiochat.EncryptedContentKeys definition

CREATE TABLE `EncryptedContentKeys` (
  `EncryptedContentId` int NOT NULL,
  `UserId` varchar(100) NOT NULL,
  `Key` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- visualstudiochat.LastReadedUserChatMap definition

CREATE TABLE `LastReadedUserChatMap` (
  `ChatId` varchar(100) NOT NULL,
  `UserId` varchar(36) NOT NULL,
  `MessageId` varchar(36) NOT NULL,
  PRIMARY KEY (`UserId`,`ChatId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- visualstudiochat.SessionTokens definition

CREATE TABLE `SessionTokens` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UserId` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedTimestamp` bigint NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=425 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- visualstudiochat.UserChatSessionKeys definition

CREATE TABLE `UserChatSessionKeys` (
  `UserId` varchar(100) NOT NULL,
  `CreatedTimestamp` bigint NOT NULL,
  `Key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- visualstudiochat.Users definition

CREATE TABLE `Users` (
  `Id` varchar(450) NOT NULL,
  `Username` varchar(255) NOT NULL,
  `HashedPassword` text NOT NULL,
  `MasterKeyProof` text NOT NULL,
  `PublicKey` text NOT NULL,
  `EncryptedPrivateKey` text NOT NULL,
  `EncryptedMainSlot` longtext,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UK_Username` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- visualstudiochat.BackupSlots definition

CREATE TABLE `BackupSlots` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` varchar(450) NOT NULL,
  `EncryptedData` longtext NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `IX_BackupSlots_UserId` (`UserId`),
  CONSTRAINT `FK_BackupSlots_Users` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=261 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- visualstudiochat.ChatParticipants definition

CREATE TABLE `ChatParticipants` (
  `ChatId` varchar(73) NOT NULL,
  `UserId` varchar(36) NOT NULL,
  PRIMARY KEY (`ChatId`,`UserId`),
  KEY `FK_Participants_User` (`UserId`),
  CONSTRAINT `FK_Participants_Chat` FOREIGN KEY (`ChatId`) REFERENCES `Chats` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Participants_User` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- visualstudiochat.Messages definition

CREATE TABLE `Messages` (
  `Id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ChatId` varchar(73) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Timestamp` bigint NOT NULL,
  `SenderId` varchar(36) NOT NULL,
  `EncryptedContentId` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IDX_ChatId` (`ChatId`),
  KEY `FK_Messages_Sender` (`SenderId`),
  CONSTRAINT `FK_Messages_Chat` FOREIGN KEY (`ChatId`) REFERENCES `Chats` (`Id`),
  CONSTRAINT `FK_Messages_Sender` FOREIGN KEY (`SenderId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- visualstudiochat.Relationships definition

CREATE TABLE `Relationships` (
  `Id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UserId` varchar(450) NOT NULL,
  `RelatedUserId` varchar(450) NOT NULL,
  `Status` varchar(20) NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uq_user_relationship` (`UserId`(150),`RelatedUserId`(150)),
  KEY `UserId` (`UserId`),
  KEY `RelatedUserId` (`RelatedUserId`),
  CONSTRAINT `Relationships_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `Relationships_ibfk_2` FOREIGN KEY (`RelatedUserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `chk_not_self_relation` CHECK ((`UserId` <> `RelatedUserId`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;