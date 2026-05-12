CREATE TABLE [dbo].[Categories] (
    [Id]               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [Name]             NVARCHAR(256)    NOT NULL,
    [Slug]             NVARCHAR(256)    NOT NULL,
    [ImageUrl]         NVARCHAR(1024)   NULL,
    [DisplayOrder]     INT              NOT NULL DEFAULT 0,
    [ParentCategoryId] UNIQUEIDENTIFIER NULL,
    [CreatedAt]        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]        DATETIME2        NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Categories_ParentCategory] FOREIGN KEY ([ParentCategoryId]) REFERENCES [dbo].[Categories] ([Id])
);
GO

CREATE UNIQUE INDEX [IX_Categories_Slug] ON [dbo].[Categories] ([Slug]);
GO
