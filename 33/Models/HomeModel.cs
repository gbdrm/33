using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace _33.Models
{
    public class HomeModel
    {
        public int HomeModelId { get; set; }

        public string BuildServerName { get; set; }
        public string BuildServerAddress { get; set; }
        public string IssueTrackerName { get; set; }
        public string IssueTrackerAddress { get; set; }

        public virtual ICollection<QuickLink> QuickLinks { get; set; }

    }
}