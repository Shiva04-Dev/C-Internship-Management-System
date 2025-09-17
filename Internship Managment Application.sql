CREATE TABLE [Student] (
  [studentID] int UNIQUE PRIMARY KEY NOT NULL,
  [firstName] string,
  [lastName] string,
  [email] varchar(50) UNIQUE,
  [password] varchar(50),
  [phoneNumber] varchar(15),
  [university] string,
  [degree] string,
  [createdAt] datetime
)
GO

CREATE TABLE [Company] (
  [companyID] int UNIQUE PRIMARY KEY NOT NULL,
  [companyName] varchar(100) UNIQUE,
  [email] varchar(50) UNIQUE,
  [passwordHash] varchar(50),
  [phoneNumber] varchar(15),
  [website] nvarchar(255),
  [updatedAt] datetime
)
GO

CREATE TABLE [Admin] (
  [adminID] int UNIQUE PRIMARY KEY NOT NULL,
  [firstName] string,
  [lastName] string,
  [email] varchar(50) UNIQUE,
  [passwordHash] varchar(50),
  [updatedAt] datetime
)
GO

CREATE TABLE [Internships] (
  [internshipID] int UNIQUE PRIMARY KEY NOT NULL,
  [companyID] int NOT NULL,
  [title] string,
  [description] string,
  [location] varchar(100),
  [startDate] datetime,
  [endDate] datetime,
  [requirements] varchar(250),
  [status] string,
  [createdAt] datetime
)
GO

CREATE TABLE [Applications] (
  [applicationID] int UNIQUE PRIMARY KEY NOT NULL,
  [internshipID] int NOT NULL,
  [studentID] int NOT NULL,
  [status] string,
  [appliedAt] datetime,
  [updatedAt] datetime,
  [resume] varchar(255)
)
GO

CREATE TABLE [Roles] (
  [roleID] int UNIQUE PRIMARY KEY NOT NULL,
  [studentID] int NOT NULL,
  [companyID] int NOT NULL,
  [adminID] int NOT NULL,
  [roleName] string
)
GO

CREATE TABLE [Feedback] (
  [feedbackID] int UNIQUE PRIMARY KEY NOT NULL,
  [internshipID] int NOT NULL,
  [studentID] int NOT NULL,
  [rating] int,
  [comment] string,
  [createdAt] datetime
)
GO

CREATE TABLE [Notifications] (
  [notificationID] int UNIQUE PRIMARY KEY NOT NULL,
  [message] string,
  [isRead] bool,
  [createdAt] datetime
)
GO

CREATE TABLE [NotificationRoles] (
  [notificationID] int NOT NULL,
  [roleID] int NOT NULL,
  PRIMARY KEY ([notificationID], [roleID])
)
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'Rate between 1-5',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Feedback',
@level2type = N'Column', @level2name = 'rating';
GO

ALTER TABLE [Internships] ADD FOREIGN KEY ([companyID]) REFERENCES [Company] ([companyID])
GO

ALTER TABLE [Applications] ADD FOREIGN KEY ([internshipID]) REFERENCES [Internships] ([internshipID])
GO

ALTER TABLE [Applications] ADD FOREIGN KEY ([studentID]) REFERENCES [Student] ([studentID])
GO

ALTER TABLE [Roles] ADD FOREIGN KEY ([studentID]) REFERENCES [Student] ([studentID])
GO

ALTER TABLE [Roles] ADD FOREIGN KEY ([companyID]) REFERENCES [Company] ([companyID])
GO

ALTER TABLE [Roles] ADD FOREIGN KEY ([adminID]) REFERENCES [Admin] ([adminID])
GO

ALTER TABLE [Feedback] ADD FOREIGN KEY ([internshipID]) REFERENCES [Internships] ([internshipID])
GO

ALTER TABLE [Feedback] ADD FOREIGN KEY ([studentID]) REFERENCES [Student] ([studentID])
GO

ALTER TABLE [NotificationRoles] ADD FOREIGN KEY ([notificationID]) REFERENCES [Notifications] ([notificationID])
GO

ALTER TABLE [NotificationRoles] ADD FOREIGN KEY ([roleID]) REFERENCES [Roles] ([roleID])
GO
