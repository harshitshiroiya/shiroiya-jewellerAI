CREATE TABLE [dbo].[Addresses] (
    [Id]         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [UserId]     NVARCHAR(450)    NOT NULL,
    [Label]      NVARCHAR(64)     NOT NULL DEFAULT '',
    [Line1]      NVARCHAR(512)    NOT NULL DEFAULT '',
    [Line2]      NVARCHAR(512)    NULL,
    [City]       NVARCHAR(128)    NOT NULL DEFAULT '',
    [State]      NVARCHAR(128)    NOT NULL DEFAULT '',
    [PostalCode] NVARCHAR(16)     NOT NULL DEFAULT '',
    [Country]    NVARCHAR(64)     NOT NULL DEFAULT '',
    [IsDefault]  BIT              NOT NULL DEFAULT 0,
    [CreatedAt]  DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]  DATETIME2        NULL,
    CONSTRAINT [PK_Addresses] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Addresses_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Addresses_UserId] ON [dbo].[Addresses] ([UserId]);
GO
