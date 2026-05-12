CREATE TABLE [dbo].[OrderItems] (
    [Id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [OrderId]         UNIQUEIDENTIFIER NOT NULL,
    [ProductId]       UNIQUEIDENTIFIER NULL,
    [CustomDesignId]  UNIQUEIDENTIFIER NULL,
    [Quantity]        INT              NOT NULL DEFAULT 1,
    [UnitPrice]       DECIMAL(18,2)    NOT NULL,
    [TotalPrice]      DECIMAL(18,2)    NOT NULL,
    [ProductSnapshot] NVARCHAR(MAX)    NOT NULL DEFAULT '{}',
    [CreatedAt]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]       DATETIME2        NULL,
    CONSTRAINT [PK_OrderItems] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_OrderItems_Orders] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_OrderItems_Products] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([Id]),
    CONSTRAINT [FK_OrderItems_CustomDesigns] FOREIGN KEY ([CustomDesignId]) REFERENCES [dbo].[CustomDesigns] ([Id])
);
GO

CREATE INDEX [IX_OrderItems_OrderId] ON [dbo].[OrderItems] ([OrderId]);
GO
