using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace _33.Models
{
    public class Question
    {
        [DisplayName("ID")]
        public int QuestionId { get; set; }

        [DataType(DataType.MultilineText)]
        [DisplayName("Question")]
        public string Content { get; set; }

        [DataType(DataType.MultilineText)]
        public string Answer { get; set; }

        [DisplayName("Date answered")]
        public DateTime? DateAnswered { get; set; }
    }
}