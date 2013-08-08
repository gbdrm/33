using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace _33.Models
{
    public class QuickLink
    {
        public int QuickLinkId { get; set; }
        public int HomeModelId { get; set; }
        public virtual HomeModel HomeModel { get; set; }

        public string LinkText { get; set; }
        public string ActionName { get; set; }
        public string ContollerName { get; set; }
    }
}