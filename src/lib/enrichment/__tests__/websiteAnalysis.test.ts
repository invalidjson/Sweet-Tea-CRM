import { describe, it, expect } from "vitest"
import { detectPlatform, detectContactForm, detectCTA, detectOnlineBooking } from "../websiteAnalysis"

function makeHeaders(entries: Record<string, string> = {}): Headers {
  return new Headers(entries)
}

describe("detectPlatform", () => {
  it("detects wordpress via wp-content in html", () => {
    expect(detectPlatform('<link href="/wp-content/themes/main.css">', makeHeaders())).toBe("wordpress")
  })

  it("detects wordpress via wp-includes", () => {
    expect(detectPlatform('<script src="/wp-includes/js/jquery.js">', makeHeaders())).toBe("wordpress")
  })

  it("detects squarespace via domain token in html", () => {
    expect(detectPlatform('<img src="https://static1.squarespace.com/img.png">', makeHeaders())).toBe("squarespace")
  })

  it("detects wix via wixstatic.com", () => {
    expect(detectPlatform('<img src="https://static.wixstatic.com/logo.png">', makeHeaders())).toBe("wix")
  })

  it("detects webflow via webflow.io token in header", () => {
    expect(detectPlatform("", makeHeaders({ "x-powered-by": "webflow.io" }))).toBe("webflow")
  })

  it("detects shopify via myshopify.com", () => {
    expect(detectPlatform('<link href="https://cdn.myshopify.com/s/files/theme.css">', makeHeaders())).toBe("shopify")
  })

  it("detects framer via framerusercontent.com", () => {
    expect(detectPlatform('<img src="https://framerusercontent.com/images/logo.png">', makeHeaders())).toBe("framer")
  })

  it("returns undefined for unknown platform", () => {
    expect(detectPlatform("<html><body>Hello world</body></html>", makeHeaders())).toBeUndefined()
  })

  it("case-insensitive match", () => {
    expect(detectPlatform('<link href="/WP-CONTENT/themes/x.css">', makeHeaders())).toBe("wordpress")
  })
})

describe("detectContactForm", () => {
  it("detects form with email field", () => {
    const html = '<form><input type="email" /><button>Send</button></form>'
    expect(detectContactForm(html)).toBe(true)
  })

  it("detects form with contact context text", () => {
    const html = "<form><p>Contact us</p><input type='text'/></form>"
    expect(detectContactForm(html)).toBe(true)
  })

  it("detects form with 'get in touch' phrase", () => {
    const html = "<form>Get in touch with us<input /></form>"
    expect(detectContactForm(html)).toBe(true)
  })

  it("no form tag → false even with email field", () => {
    const html = '<input type="email" />'
    expect(detectContactForm(html)).toBe(false)
  })

  it("form without email field or contact context → false", () => {
    const html = "<form><input type='text' name='search'><button>Go</button></form>"
    expect(detectContactForm(html)).toBe(false)
  })

  it("detects 'send us' phrase", () => {
    const html = "<form>Send us a message</form>"
    expect(detectContactForm(html)).toBe(true)
  })

  it("detects 'message us' phrase", () => {
    const html = "<form>Message us anytime</form>"
    expect(detectContactForm(html)).toBe(true)
  })
})

describe("detectCTA", () => {
  it("detects 'get a quote'", () => {
    expect(detectCTA("<button>Get a Quote</button>")).toBe(true)
  })

  it("detects 'call now'", () => {
    expect(detectCTA("<a href='tel:555'>Call Now</a>")).toBe(true)
  })

  it("detects 'book now'", () => {
    expect(detectCTA("<button>Book Now</button>")).toBe(true)
  })

  it("detects 'schedule'", () => {
    expect(detectCTA("<a>Schedule a Visit</a>")).toBe(true)
  })

  it("detects 'free quote'", () => {
    expect(detectCTA("Get a Free Quote today")).toBe(true)
  })

  it("detects 'request service'", () => {
    expect(detectCTA("<button>Request Service</button>")).toBe(true)
  })

  it("detects 'get estimate'", () => {
    expect(detectCTA("Get Estimate Now")).toBe(true)
  })

  it("no CTA keywords → false", () => {
    expect(detectCTA("<p>Welcome to our website. We sell stuff.</p>")).toBe(false)
  })

  it("case-insensitive match", () => {
    expect(detectCTA("GET A QUOTE")).toBe(true)
  })
})

describe("detectOnlineBooking", () => {
  it("detects 'book online'", () => {
    expect(detectOnlineBooking("Book Online Today")).toBe(true)
  })

  it("detects 'book appointment'", () => {
    expect(detectOnlineBooking("<a>Book Appointment</a>")).toBe(true)
  })

  it("detects 'schedule online'", () => {
    expect(detectOnlineBooking("Schedule Online now")).toBe(true)
  })

  it("detects 'online booking' phrase", () => {
    expect(detectOnlineBooking("Use our online booking system to schedule.")).toBe(true)
  })

  it("detects calendly embed", () => {
    expect(detectOnlineBooking('<script src="https://calendly.com/assets/external/widget.js">')).toBe(true)
  })

  it("detects acuity", () => {
    expect(detectOnlineBooking('<iframe src="https://acuity.com/schedule">')).toBe(true)
  })

  it("detects booksy", () => {
    expect(detectOnlineBooking("Book via Booksy")).toBe(true)
  })

  it("detects vagaro", () => {
    expect(detectOnlineBooking("Powered by Vagaro")).toBe(true)
  })

  it("no booking signals → false", () => {
    expect(detectOnlineBooking("<p>Call us to make an appointment.</p>")).toBe(false)
  })
})
