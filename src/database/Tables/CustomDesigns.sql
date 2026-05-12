CREATE TABLE [dbo].[CustomDesigns] (
    [Id]                UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [UserId]            NVARCHAR(450)    NOT NULL,
    [BaseType]          INT              NOT NULL,
    [MetalType]         INT              NOT NULL,
    [Purity]            NVARCHAR(16)     NOT NULL DEFAULT '',
    [StoneType]         INT              NOT NULL DEFAULT 0,
    [StoneShape]        INT              NULL,
    [StoneColor]        NVARCHAR(64)     NULL,
    [StoneClarity]      NVARCHAR(64)     NULL,
    [StoneCarat]        DECIMAL(8,3)     NULL,
    [ConfigurationJson] NVARCHAR(MAX)    NOT NULL DEFAULT '{}',
    [PreviewImageUrl]   NVARCHAR(1024)   NULL,
    [EstimatedPrice]    DECIMAL(18,2)    NOT NULL DEFAULT 0,
    [Status]            INT              NOT NULL DEFAULT 0,
    [CreatedAt]         DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]         DATETIME2        NULL,
    CONSTRAINT [PK_CustomDesigns] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_CustomDesigns_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_CustomDesigns_UserId] ON [dbo].[CustomDesigns] ([UserId]);
GO
