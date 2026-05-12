CREATE TABLE [dbo].[Orders] (
    [Id]                     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [UserId]                 NVARCHAR(450)    NOT NULL,
    [OrderNumber]            NVARCHAR(32)     NOT NULL,
    [Status]                 INT              NOT NULL DEFAULT 0,
    [SubTotal]               DECIMAL(18,2)    NOT NULL,
    [TaxPercent]             DECIMAL(5,2)     NOT NULL DEFAULT 0,
    [TaxAmount]              DECIMAL(18,2)    NOT NULL DEFAULT 0,
    [ShippingCost]           DECIMAL(18,2)    NOT NULL DEFAULT 0,
    [TotalAmount]            DECIMAL(18,2)    NOT NULL,
    [ShippingAddressId]      UNIQUEIDENTIFIER NOT NULL,
    [StripePaymentIntentId]  NVARCHAR(256)    NULL,
    [PaymentStatus]          INT              NOT NULL DEFAULT 0,
    [AdminNotes]             NVARCHAR(MAX)    NULL,
    [CreatedAt]              DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]              DATETIME2        NULL,
    CONSTRAINT [PK_Orders] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Orders_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]),
    CONSTRAINT [FK_Orders_Addresses] FOREIGN KEY ([ShippingAddressId]) REFERENCES [dbo].[Addresses] ([Id])
);
GO

CREATE UNIQUE INDEX [IX_Orders_OrderNumber] ON [dbo].[Orders] ([OrderNumber]);
GO
CREATE INDEX [IX_Orders_UserId] ON [dbo].[Orders] ([UserId]);
GO
CREATE INDEX [IX_Orders_Status] ON [dbo].[Orders] ([Status]);
GO
