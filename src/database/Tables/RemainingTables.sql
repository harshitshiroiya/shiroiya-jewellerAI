CREATE TABLE [dbo].[OrderStatusHistories] (
    [Id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [OrderId]         UNIQUEIDENTIFIER NOT NULL,
    [FromStatus]      INT              NOT NULL,
    [ToStatus]        INT              NOT NULL,
    [ChangedByUserId] NVARCHAR(450)    NULL,
    [Notes]           NVARCHAR(MAX)    NULL,
    [CreatedAt]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]       DATETIME2        NULL,
    CONSTRAINT [PK_OrderStatusHistories] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_OrderStatusHistories_Orders] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_OrderStatusHistories_OrderId] ON [dbo].[OrderStatusHistories] ([OrderId]);
GO

CREATE TABLE [dbo].[Payments] (
    [Id]                    UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [OrderId]               UNIQUEIDENTIFIER NOT NULL,
    [StripePaymentIntentId] NVARCHAR(256)    NOT NULL,
    [StripeChargeId]        NVARCHAR(256)    NULL,
    [Amount]                DECIMAL(18,2)    NOT NULL,
    [Currency]              NVARCHAR(8)      NOT NULL DEFAULT 'inr',
    [Status]                INT              NOT NULL DEFAULT 0,
    [CreatedAt]             DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]             DATETIME2        NULL,
    CONSTRAINT [PK_Payments] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Payments_Orders] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders] ([Id]) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX [IX_Payments_OrderId] ON [dbo].[Payments] ([OrderId]);
GO

CREATE TABLE [dbo].[CartItems] (
    [Id]             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [UserId]         NVARCHAR(450)    NOT NULL,
    [ProductId]      UNIQUEIDENTIFIER NULL,
    [CustomDesignId] UNIQUEIDENTIFIER NULL,
    [Quantity]       INT              NOT NULL DEFAULT 1,
    [UnitPrice]      DECIMAL(18,2)    NOT NULL DEFAULT 0,
    [CreatedAt]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]      DATETIME2        NULL,
    CONSTRAINT [PK_CartItems] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_CartItems_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CartItems_Products] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([Id]),
    CONSTRAINT [FK_CartItems_CustomDesigns] FOREIGN KEY ([CustomDesignId]) REFERENCES [dbo].[CustomDesigns] ([Id])
);
GO

CREATE INDEX [IX_CartItems_UserId] ON [dbo].[CartItems] ([UserId]);
GO

CREATE TABLE [dbo].[AIConversations] (
    [Id]                    UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [UserId]                NVARCHAR(450)    NOT NULL,
    [MessagesJson]          NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    [RecommendedProductIds] NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    [GeneratedImageUrls]    NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    [CreatedAt]             DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]             DATETIME2        NULL,
    CONSTRAINT [PK_AIConversations] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_AIConversations_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AIConversations_UserId] ON [dbo].[AIConversations] ([UserId]);
GO

CREATE TABLE [dbo].[Certificates] (
    [Id]                UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [OrderItemId]       UNIQUEIDENTIFIER NOT NULL,
    [CertificateType]   INT              NOT NULL,
    [CertificateNumber] NVARCHAR(64)     NOT NULL,
    [PdfUrl]            NVARCHAR(1024)   NULL,
    [IssuedAt]          DATETIME2        NULL,
    [MetadataJson]      NVARCHAR(MAX)    NOT NULL DEFAULT '{}',
    [CreatedAt]         DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]         DATETIME2        NULL,
    CONSTRAINT [PK_Certificates] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Certificates_OrderItems] FOREIGN KEY ([OrderItemId]) REFERENCES [dbo].[OrderItems] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [dbo].[Invoices] (
    [Id]            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [OrderId]       UNIQUEIDENTIFIER NOT NULL,
    [InvoiceNumber] NVARCHAR(32)     NOT NULL,
    [PdfUrl]        NVARCHAR(1024)   NULL,
    [GSTNumber]     NVARCHAR(32)     NULL,
    [HSNSAC]        NVARCHAR(16)     NULL,
    [SubTotal]      DECIMAL(18,2)    NOT NULL,
    [CGST]          DECIMAL(18,2)    NOT NULL DEFAULT 0,
    [SGST]          DECIMAL(18,2)    NOT NULL DEFAULT 0,
    [IGST]          DECIMAL(18,2)    NOT NULL DEFAULT 0,
    [TotalAmount]   DECIMAL(18,2)    NOT NULL,
    [GeneratedAt]   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [CreatedAt]     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]     DATETIME2        NULL,
    CONSTRAINT [PK_Invoices] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Invoices_Orders] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders] ([Id]) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX [IX_Invoices_OrderId] ON [dbo].[Invoices] ([OrderId]);
GO
CREATE UNIQUE INDEX [IX_Invoices_InvoiceNumber] ON [dbo].[Invoices] ([InvoiceNumber]);
GO

CREATE TABLE [dbo].[Promotions] (
    [Id]                UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [Code]              NVARCHAR(64)     NOT NULL,
    [Description]       NVARCHAR(512)    NOT NULL DEFAULT '',
    [DiscountType]      INT              NOT NULL,
    [DiscountValue]     DECIMAL(18,2)    NOT NULL,
    [MinOrderAmount]    DECIMAL(18,2)    NULL,
    [ValidFrom]         DATETIME2        NOT NULL,
    [ValidTo]           DATETIME2        NOT NULL,
    [IsActive]          BIT              NOT NULL DEFAULT 1,
    [MaxUsageCount]     INT              NOT NULL DEFAULT 0,
    [CurrentUsageCount] INT              NOT NULL DEFAULT 0,
    [CreatedAt]         DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]         DATETIME2        NULL,
    CONSTRAINT [PK_Promotions] PRIMARY KEY CLUSTERED ([Id])
);
GO

CREATE UNIQUE INDEX [IX_Promotions_Code] ON [dbo].[Promotions] ([Code]);
GO
