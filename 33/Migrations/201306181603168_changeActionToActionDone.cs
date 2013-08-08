namespace _33.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class changeActionToActionDone : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.CodeReviews", "ActionDone", c => c.String());
            DropColumn("dbo.CodeReviews", "Action");
        }
        
        public override void Down()
        {
            AddColumn("dbo.CodeReviews", "Action", c => c.String());
            DropColumn("dbo.CodeReviews", "ActionDone");
        }
    }
}
