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
    public class QuickLinkController : Controller
    {
        private DataContext db = new DataContext();

        //
        // GET: /QuickLink/

        public ActionResult Index()
        {
            var quicklinks = db.QuickLinks.Include(q => q.HomeModel);
            return View(quicklinks.ToList());
        }

        //
        // GET: /QuickLink/Details/5

        public ActionResult Details(int id = 0)
        {
            QuickLink quicklink = db.QuickLinks.Find(id);
            if (quicklink == null)
            {
                return HttpNotFound();
            }
            return View(quicklink);
        }

        //
        // GET: /QuickLink/Create

        public ActionResult Create()
        {
            ViewBag.HomeModelId = new SelectList(db.HomeModels, "HomeModelId", "BuildServerName");
            return View();
        }

        //
        // POST: /QuickLink/Create

        [HttpPost]
        public ActionResult Create(QuickLink quicklink)
        {
            if (ModelState.IsValid)
            {
                db.QuickLinks.Add(quicklink);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.HomeModelId = new SelectList(db.HomeModels, "HomeModelId", "BuildServerName", quicklink.HomeModelId);
            return View(quicklink);
        }

        //
        // GET: /QuickLink/Edit/5

        public ActionResult Edit(int id = 0)
        {
            QuickLink quicklink = db.QuickLinks.Find(id);
            if (quicklink == null)
            {
                return HttpNotFound();
            }
            ViewBag.HomeModelId = new SelectList(db.HomeModels, "HomeModelId", "BuildServerName", quicklink.HomeModelId);
            return View(quicklink);
        }

        //
        // POST: /QuickLink/Edit/5

        [HttpPost]
        public ActionResult Edit(QuickLink quicklink)
        {
            if (ModelState.IsValid)
            {
                db.Entry(quicklink).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.HomeModelId = new SelectList(db.HomeModels, "HomeModelId", "BuildServerName", quicklink.HomeModelId);
            return View(quicklink);
        }

        //
        // GET: /QuickLink/Delete/5

        public ActionResult Delete(int id = 0)
        {
            QuickLink quicklink = db.QuickLinks.Find(id);
            if (quicklink == null)
            {
                return HttpNotFound();
            }
            return View(quicklink);
        }

        //
        // POST: /QuickLink/Delete/5

        [HttpPost, ActionName("Delete")]
        public ActionResult DeleteConfirmed(int id)
        {
            QuickLink quicklink = db.QuickLinks.Find(id);
            db.QuickLinks.Remove(quicklink);
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