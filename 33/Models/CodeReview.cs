using System;
using System.ComponentModel.DataAnnotations;

namespace _33.Models
{
    public class CodeReview
    {
        public int CodeReviewId { get; set; }

        public int Changeset { get; set; }

        public string File { get; set; }

        public string Lines { get; set; }

        [DataType(DataType.MultilineText)]
        public string Comment { get; set; }

        [DataType(DataType.MultilineText)]
        public string ActionDone { get; set; }

        public DateTime DateAdded { get; set; }

        public DateTime? DateComplete { get; set; }
    }
}