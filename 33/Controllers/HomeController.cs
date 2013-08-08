using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using _33.Models;

namespace _33.Controllers
{
    public class HomeController : Controller
    {
        private DataContext db = new DataContext();
        
        public ActionResult Index()
        {
            ViewBag.Message = "Development stuff.";

            var model = db.HomeModels.FirstOrDefault();

            return View(model);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}
