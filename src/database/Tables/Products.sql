CREATE TABLE [dbo].[Products] (
    [Id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [Name]            NVARCHAR(512)    NOT NULL,
    [Description]     NVARCHAR(MAX)    NOT NULL DEFAULT '',
    [SKU]             NVARCHAR(128)    NOT NULL,
    [CategoryId]      UNIQUEIDENTIFIER NOT NULL,
    [JewelleryType]   INT              NOT NULL,
    [MetalType]       INT              NOT NULL,
    [Purity]          NVARCHAR(16)     NOT NULL DEFAULT '',
    [WeightInGrams]   DECIMAL(10,3)    NOT NULL DEFAULT 0,
    [StoneType]       INT              NOT NULL DEFAULT 0,
    [StoneShape]      INT              NULL,
    [StoneColor]      NVARCHAR(64)     NULL,
    [StoneClarity]    NVARCHAR(64)     NULL,
    [StoneCarat]      DECIMAL(8,3)     NULL,
    [MakingChargePercent] DECIMAL(5,2) NOT NULL DEFAULT 0,
    [WastagePercent]  DECIMAL(5,2)     NOT NULL DEFAULT 0,
    [StonePrice]      DECIMAL(18,2)    NOT NULL DEFAULT 0,
    [BasePrice]       DECIMAL(18,2)    NOT NULL,
    [SellingPrice]    DECIMAL(18,2)    NOT NULL,
    [DiscountPercent] DECIMAL(5,2)     NOT NULL DEFAULT 0,
    [StockQuantity]   INT              NOT NULL DEFAULT 0,
    [ImageUrls]       NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    [ThreeDModelUrl]  NVARCHAR(1024)   NULL,
    [IsFeatured]      BIT              NOT NULL DEFAULT 0,
    [IsActive]        BIT              NOT NULL DEFAULT 1,
    [CreatedAt]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]       DATETIME2        NULL,
    CONSTRAINT [PK_Products] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Products_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories] ([Id])
);
GO

CREATE UNIQUE INDEX [IX_Products_SKU] ON [dbo].[Products] ([SKU]);
GO
CREATE INDEX [IX_Products_CategoryId] ON [dbo].[Products] ([CategoryId]);
GO
CREATE INDEX [IX_Products_IsFeatured] ON [dbo].[Products] ([IsFeatured]) WHERE [IsFeatured] = 1;
GO
