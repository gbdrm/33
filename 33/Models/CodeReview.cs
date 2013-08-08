using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace _33.Models
{
    public class CodeReview
    {
        [DisplayName("ID")]
        public int CodeReviewId { get; set; }

        public int Changeset { get; set; }

        public string File { get; set; }

        public string Lines { get; set; }

        [DataType(DataType.MultilineText)]
        public string Comment { get; set; }

        [DataType(DataType.MultilineText)]
        [DisplayName("Action")]
        public string ActionDone { get; set; }

        [DisplayName("Added")]
        public DateTime DateAdded { get; set; }

        [DisplayName("Complete")]
        public DateTime? DateComplete { get; set; }
    }
}