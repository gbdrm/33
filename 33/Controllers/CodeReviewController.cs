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
    public class CodeReviewController : Controller
    {
        private DataContext db = new DataContext();

        //
        // GET: /CodeReview/

        public ActionResult Index()
        {
            return View(db.CodeReviews.ToList());
        }

        //
        // GET: /CodeReview/NotDone

        public ActionResult NotDone()
        {
            return View(db.CodeReviews.Where(_ => string.IsNullOrEmpty(_.ActionDone)).ToList());
        }

        //
        // GET: /CodeReview/Details/5

        public ActionResult Details(int id = 0)
        {
            CodeReview codereview = db.CodeReviews.Find(id);
            if (codereview == null)
            {
                return HttpNotFound();
            }
            return View(codereview);
        }

        //
        // GET: /CodeReview/Create

        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /CodeReview/Create

        [HttpPost]
        public ActionResult Create(CodeReview codereview)
        {
            if (ModelState.IsValid)
            {
                codereview.DateAdded = DateTime.Now;
                db.CodeReviews.Add(codereview);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(codereview);
        }

        //
        // GET: /CodeReview/Edit/5

        public ActionResult Edit(int id = 0)
        {
            CodeReview codereview = db.CodeReviews.Find(id);
            if (codereview == null)
            {
                return HttpNotFound();
            }
            return View(codereview);
        }

        //
        // POST: /CodeReview/Edit/5

        [HttpPost]
        public ActionResult Edit(CodeReview codereview)
        {
            if (ModelState.IsValid)
            {
                db.Entry(codereview).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(codereview);
        }

        //
        // GET: /CodeReview/Fix/5

        public ActionResult Fix(int id = 0)
        {
            CodeReview codereview = db.CodeReviews.Find(id);
            if (codereview == null)
            {
                return HttpNotFound();
            }
            return View(codereview);
        }

        //
        // POST: /CodeReview/Fix/5

        [HttpPost]
        public ActionResult Fix(CodeReview codereview)
        {
            if (ModelState.IsValid)
            {
                var fixedReview = db.CodeReviews.First(_ => _.CodeReviewId == codereview.CodeReviewId);

                fixedReview.DateComplete = DateTime.Now;
                fixedReview.ActionDone = codereview.ActionDone;

                db.Entry(fixedReview).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(codereview);
        }

        //
        // GET: /CodeReview/Delete/5

        public ActionResult Delete(int id = 0)
        {
            CodeReview codereview = db.CodeReviews.Find(id);
            if (codereview == null)
            {
                return HttpNotFound();
            }
            return View(codereview);
        }

        //
        // POST: /CodeReview/Delete/5

        [HttpPost, ActionName("Delete")]
        public ActionResult DeleteConfirmed(int id)
        {
            CodeReview codereview = db.CodeReviews.Find(id);
            db.CodeReviews.Remove(codereview);
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