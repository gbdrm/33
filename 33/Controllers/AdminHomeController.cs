using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using _33.Models;

namespace _33.Controllers
{
    public class AdminHomeController : Controller
    {
        private DataContext db = new DataContext();

        //
        // GET: /AdminHome/

        public ActionResult Index()
        {
            return View(db.HomeModels.ToList());
        }

        //
        // GET: /AdminHome/Details/5

        public ActionResult Details(int id = 0)
        {
            HomeModel homemodel = db.HomeModels.Find(id);
            if (homemodel == null)
            {
                return HttpNotFound();
            }
            return View(homemodel);
        }

        //
        // GET: /AdminHome/Create

        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /AdminHome/Create

        [HttpPost]
        public ActionResult Create(HomeModel homemodel)
        {
            if (ModelState.IsValid)
            {
                db.HomeModels.Add(homemodel);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(homemodel);
        }

        //
        // GET: /AdminHome/Edit/5

        public ActionResult Edit(int id = 0)
        {
            HomeModel homemodel = db.HomeModels.Find(id);
            if (homemodel == null)
            {
                return HttpNotFound();
            }
            return View(homemodel);
        }

        //
        // POST: /AdminHome/Edit/5

        [HttpPost]
        public ActionResult Edit(HomeModel homemodel)
        {
            if (ModelState.IsValid)
            {
                db.Entry(homemodel).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(homemodel);
        }

        //
        // GET: /AdminHome/Delete/5

        public ActionResult Delete(int id = 0)
        {
            HomeModel homemodel = db.HomeModels.Find(id);
            if (homemodel == null)
            {
                return HttpNotFound();
            }
            return View(homemodel);
        }

        //
        // POST: /AdminHome/Delete/5

        [HttpPost, ActionName("Delete")]
        public ActionResult DeleteConfirmed(int id)
        {
            HomeModel homemodel = db.HomeModels.Find(id);
            db.HomeModels.Remove(homemodel);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}