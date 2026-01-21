IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [Admins] (
        [AdminID] int NOT NULL IDENTITY,
        [FirstName] nvarchar(50) NOT NULL,
        [LastName] nvarchar(50) NOT NULL,
        [Email] nvarchar(50) NOT NULL,
        [PasswordHash] nvarchar(255) NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Admins] PRIMARY KEY ([AdminID])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [Companies] (
        [CompanyID] int NOT NULL IDENTITY,
        [CompanyName] nvarchar(100) NOT NULL,
        [Email] nvarchar(50) NOT NULL,
        [PasswordHash] nvarchar(255) NOT NULL,
        [PhoneNumber] nvarchar(15) NOT NULL,
        [Website] nvarchar(max) NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Companies] PRIMARY KEY ([CompanyID])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [Notifications] (
        [NotificationID] int NOT NULL IDENTITY,
        [Message] nvarchar(max) NOT NULL,
        [IsRead] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([NotificationID])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [Roles] (
        [RoleID] int NOT NULL IDENTITY,
        [RoleName] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([RoleID])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [Students] (
        [StudentID] int NOT NULL IDENTITY,
        [FirstName] nvarchar(50) NOT NULL,
        [LastName] nvarchar(50) NOT NULL,
        [Email] nvarchar(50) NOT NULL,
        [PasswordHash] nvarchar(255) NOT NULL,
        [PhoneNumber] nvarchar(15) NOT NULL,
        [University] nvarchar(max) NOT NULL,
        [Degree] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Students] PRIMARY KEY ([StudentID])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [Internships] (
        [InternshipID] int NOT NULL IDENTITY,
        [CompanyID] int NOT NULL,
        [Title] nvarchar(100) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Location] nvarchar(100) NOT NULL,
        [StartDate] datetime2 NOT NULL,
        [EndDate] datetime2 NOT NULL,
        [Requirements] nvarchar(250) NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Internships] PRIMARY KEY ([InternshipID]),
        CONSTRAINT [FK_Internships_Companies_CompanyID] FOREIGN KEY ([CompanyID]) REFERENCES [Companies] ([CompanyID]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [NotificationRoles] (
        [NotificationID] int NOT NULL,
        [RoleID] int NOT NULL,
        CONSTRAINT [PK_NotificationRoles] PRIMARY KEY ([NotificationID], [RoleID]),
        CONSTRAINT [FK_NotificationRoles_Notifications_NotificationID] FOREIGN KEY ([NotificationID]) REFERENCES [Notifications] ([NotificationID]) ON DELETE CASCADE,
        CONSTRAINT [FK_NotificationRoles_Roles_RoleID] FOREIGN KEY ([RoleID]) REFERENCES [Roles] ([RoleID]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [CompanyBans] (
        [BanID] int NOT NULL IDENTITY,
        [CompanyID] int NOT NULL,
        [StudentID] int NOT NULL,
        [BannedAt] datetime2 NOT NULL,
        [Reason] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_CompanyBans] PRIMARY KEY ([BanID]),
        CONSTRAINT [FK_CompanyBans_Companies_CompanyID] FOREIGN KEY ([CompanyID]) REFERENCES [Companies] ([CompanyID]) ON DELETE CASCADE,
        CONSTRAINT [FK_CompanyBans_Students_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [Students] ([StudentID]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [RefreshTokens] (
        [RefreshTokenID] int NOT NULL IDENTITY,
        [Token] nvarchar(500) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [IsRevoked] bit NOT NULL,
        [CreatedByIP] nvarchar(45) NULL,
        [UserType] nvarchar(20) NOT NULL,
        [StudentID] int NULL,
        [CompanyID] int NULL,
        [AdminID] int NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([RefreshTokenID]),
        CONSTRAINT [FK_RefreshTokens_Admins_AdminID] FOREIGN KEY ([AdminID]) REFERENCES [Admins] ([AdminID]) ON DELETE CASCADE,
        CONSTRAINT [FK_RefreshTokens_Companies_CompanyID] FOREIGN KEY ([CompanyID]) REFERENCES [Companies] ([CompanyID]) ON DELETE CASCADE,
        CONSTRAINT [FK_RefreshTokens_Students_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [Students] ([StudentID]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [UserBans] (
        [BanID] int NOT NULL IDENTITY,
        [UserType] nvarchar(max) NOT NULL,
        [StudentID] int NULL,
        [CompanyID] int NULL,
        [BannedAt] datetime2 NOT NULL,
        [Reason] nvarchar(max) NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_UserBans] PRIMARY KEY ([BanID]),
        CONSTRAINT [FK_UserBans_Companies_CompanyID] FOREIGN KEY ([CompanyID]) REFERENCES [Companies] ([CompanyID]),
        CONSTRAINT [FK_UserBans_Students_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [Students] ([StudentID])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [Applications] (
        [ApplicationID] int NOT NULL IDENTITY,
        [InternshipID] int NOT NULL,
        [StudentID] int NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [AppliedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [Resume] nvarchar(255) NOT NULL,
        CONSTRAINT [PK_Applications] PRIMARY KEY ([ApplicationID]),
        CONSTRAINT [FK_Applications_Internships_InternshipID] FOREIGN KEY ([InternshipID]) REFERENCES [Internships] ([InternshipID]) ON DELETE CASCADE,
        CONSTRAINT [FK_Applications_Students_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [Students] ([StudentID]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE TABLE [Feedbacks] (
        [FeedbackID] int NOT NULL IDENTITY,
        [InternshipID] int NOT NULL,
        [StudentID] int NOT NULL,
        [Rating] int NOT NULL,
        [Comment] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Feedbacks] PRIMARY KEY ([FeedbackID]),
        CONSTRAINT [FK_Feedbacks_Internships_InternshipID] FOREIGN KEY ([InternshipID]) REFERENCES [Internships] ([InternshipID]) ON DELETE CASCADE,
        CONSTRAINT [FK_Feedbacks_Students_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [Students] ([StudentID]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Admins_Email] ON [Admins] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Applications_InternshipID] ON [Applications] ([InternshipID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Applications_StudentID] ON [Applications] ([StudentID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Companies_Email] ON [Companies] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CompanyBans_CompanyID] ON [CompanyBans] ([CompanyID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CompanyBans_StudentID] ON [CompanyBans] ([StudentID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Feedbacks_InternshipID] ON [Feedbacks] ([InternshipID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Feedbacks_StudentID] ON [Feedbacks] ([StudentID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Internships_CompanyID] ON [Internships] ([CompanyID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_NotificationRoles_RoleID] ON [NotificationRoles] ([RoleID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_AdminID] ON [RefreshTokens] ([AdminID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_CompanyID] ON [RefreshTokens] ([CompanyID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_StudentID] ON [RefreshTokens] ([StudentID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Students_Email] ON [Students] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserBans_CompanyID] ON [UserBans] ([CompanyID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserBans_StudentID] ON [UserBans] ([StudentID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119152806_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260119152806_InitialCreate', N'9.0.9');
END;

COMMIT;
GO

