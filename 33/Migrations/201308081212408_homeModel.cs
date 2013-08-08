namespace _33.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class homeModel : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.QuickLinks",
                c => new
                    {
                        QuickLinkId = c.Int(nullable: false, identity: true),
                        HomeModelId = c.Int(nullable: false),
                        LinkText = c.String(),
                        ActionName = c.String(),
                        ContollerName = c.String(),
                    })
                .PrimaryKey(t => t.QuickLinkId)
                .ForeignKey("dbo.HomeModels", t => t.HomeModelId, cascadeDelete: true)
                .Index(t => t.HomeModelId);
            
            CreateTable(
                "dbo.HomeModels",
                c => new
                    {
                        HomeModelId = c.Int(nullable: false, identity: true),
                        BuildServerName = c.String(),
                        BuildServerAddress = c.String(),
                        IssueTrackerName = c.String(),
                        IssueTrackerAddress = c.String(),
                    })
                .PrimaryKey(t => t.HomeModelId);
            
        }
        
        public override void Down()
        {
            DropIndex("dbo.QuickLinks", new[] { "HomeModelId" });
            DropForeignKey("dbo.QuickLinks", "HomeModelId", "dbo.HomeModels");
            DropTable("dbo.HomeModels");
            DropTable("dbo.QuickLinks");
        }
    }
}
