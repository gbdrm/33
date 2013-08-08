using System;
using System.ComponentModel.DataAnnotations;

namespace _33.Models
{
    public class Question
    {
        public int QuestionId { get; set; }

        [DataType(DataType.MultilineText)]
        public string Content { get; set; }

        [DataType(DataType.MultilineText)]
        public string Answer { get; set; }

        public DateTime? DateAnswered { get; set; }
    }
}