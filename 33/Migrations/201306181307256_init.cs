namespace _33.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class init : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.CodeReviews",
                c => new
                    {
                        CodeReviewId = c.Int(nullable: false, identity: true),
                        Changeset = c.Int(nullable: false),
                        File = c.String(),
                        Lines = c.String(),
                        Comment = c.String(),
                        Action = c.String(),
                        DateAdded = c.DateTime(nullable: false),
                        DateComplete = c.DateTime(),
                    })
                .PrimaryKey(t => t.CodeReviewId);
            
            AddColumn("dbo.Questions", "Answer", c => c.String());
            AddColumn("dbo.Questions", "DateAnswered", c => c.DateTime());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Questions", "DateAnswered");
            DropColumn("dbo.Questions", "Answer");
            DropTable("dbo.CodeReviews");
        }
    }
}
