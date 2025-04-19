import os
import logging
from datetime import datetime

from flask import Flask, render_template, redirect, url_for, request, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import generate_password_hash, check_password_hash

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Define base model class
class Base(DeclarativeBase):
    pass

# Initialize SQLAlchemy
db = SQLAlchemy(model_class=Base)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "railguard_secret_key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///railguard.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the app with SQLAlchemy
db.init_app(app)

# Import routes and models
with app.app_context():
    # Import models
    from models import User, Ticket, TrustID, Complaint, Fine, Seat, StandingZone, EmergencySlip
    
    # Create all database tables
    db.create_all()
    
    # Import utility modules
    from utils.sms import send_sms_notification
    from utils.qr_code import generate_qr_code
    from utils.blockchain import create_trust_id
    from utils.ai import analyze_complaint_risk

# Routes
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    # Get counts for dashboard
    complaint_count = Complaint.query.count()
    high_risk_complaints = Complaint.query.filter_by(risk_level="High").count()
    ticket_count = Ticket.query.count()
    trust_id_count = TrustID.query.count()
    standing_count = StandingZone.query.count()
    
    return render_template("dashboard.html", 
                           complaint_count=complaint_count,
                           high_risk_complaints=high_risk_complaints,
                           ticket_count=ticket_count,
                           trust_id_count=trust_id_count,
                           standing_count=standing_count)

# Complaint system routes
@app.route("/complaints", methods=["GET", "POST"])
def complaints():
    if request.method == "POST":
        phone = request.form.get("phone")
        message = request.form.get("message")
        
        if not phone or not message:
            flash("Phone number and message are required", "danger")
            return redirect(url_for("complaints"))
        
        # Analyze complaint risk using AI
        risk_level = analyze_complaint_risk(message)
        
        # Create and save complaint
        new_complaint = Complaint(
            phone=phone,
            message=message,
            timestamp=datetime.now(),
            risk_level=risk_level
        )
        db.session.add(new_complaint)
        db.session.commit()
        
        # Send confirmation SMS
        try:
            send_sms_notification(
                phone, 
                f"Your complaint has been registered. Risk level: {risk_level}. We'll take action accordingly."
            )
            flash("Complaint submitted successfully", "success")
        except Exception as e:
            logger.error(f"SMS notification failed: {e}")
            flash("Complaint submitted but SMS notification failed", "warning")
        
        return redirect(url_for("complaints"))
    
    # GET request - display all complaints
    complaints_list = Complaint.query.order_by(Complaint.timestamp.desc()).all()
    return render_template("complaints.html", complaints=complaints_list)

# Trust ID routes
@app.route("/trust-id", methods=["GET", "POST"])
def trust_id():
    if request.method == "POST":
        phone = request.form.get("phone")
        aadhaar = request.form.get("aadhaar", "")  # Optional
        
        if not phone:
            flash("Phone number is required", "danger")
            return redirect(url_for("trust_id"))
        
        # Check if Trust ID already exists
        existing_id = TrustID.query.filter_by(phone=phone).first()
        if existing_id:
            flash("Trust ID already exists for this phone number", "warning")
            return redirect(url_for("trust_id"))
        
        # Generate Trust ID using blockchain
        tid_hash, ipfs_cid = create_trust_id(phone, aadhaar)
        
        # Save Trust ID
        new_tid = TrustID(
            phone=phone,
            tid_hash=tid_hash,
            ipfs_cid=ipfs_cid,
            created_at=datetime.now()
        )
        db.session.add(new_tid)
        db.session.commit()
        
        flash("Trust ID created successfully", "success")
        return redirect(url_for("trust_id"))
    
    # GET request - display all Trust IDs
    trust_ids = TrustID.query.order_by(TrustID.created_at.desc()).all()
    return render_template("trust_id.html", trust_ids=trust_ids)

# Ticket and QR code routes
@app.route("/ticket", methods=["GET", "POST"])
def ticket():
    if request.method == "POST":
        phone = request.form.get("phone")
        train_number = request.form.get("train_number")
        coach = request.form.get("coach")
        seat = request.form.get("seat")
        
        if not all([phone, train_number, coach, seat]):
            flash("All fields are required", "danger")
            return redirect(url_for("ticket"))
        
        # Check if Trust ID exists
        trust_id = TrustID.query.filter_by(phone=phone).first()
        if not trust_id:
            flash("Trust ID not found for this phone number. Please create one first.", "warning")
            return redirect(url_for("trust_id"))
        
        # Generate QR code
        ticket_data = f"{train_number}|{coach}|{seat}|{phone}"
        qr_code = generate_qr_code(ticket_data)
        
        # Create and save ticket
        new_ticket = Ticket(
            phone=phone,
            train_number=train_number,
            coach=coach,
            seat=seat,
            qr_code=qr_code,
            created_at=datetime.now(),
            status="valid"
        )
        db.session.add(new_ticket)
        
        # Update seat status
        seat_record = Seat.query.filter_by(coach=coach, seat_number=seat).first()
        if not seat_record:
            seat_record = Seat(coach=coach, seat_number=seat, status="occupied", phone=phone)
            db.session.add(seat_record)
        else:
            seat_record.status = "occupied"
            seat_record.phone = phone
            
        db.session.commit()
        
        flash("Ticket generated successfully", "success")
        return redirect(url_for("ticket", ticket_id=new_ticket.id))
    
    # GET request - display ticket if ID provided, else form
    ticket_id = request.args.get("ticket_id")
    if ticket_id:
        ticket = Ticket.query.get(ticket_id)
        if ticket:
            return render_template("ticket.html", ticket=ticket, qr_code=ticket.qr_code)
    
    # Display all tickets
    tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
    return render_template("ticket.html", tickets=tickets)

# Standing Zone routes
@app.route("/standing-zone", methods=["GET", "POST"])
def standing_zone():
    if request.method == "POST":
        phone = request.form.get("phone")
        train_number = request.form.get("train_number")
        coach = request.form.get("coach")
        zone = request.form.get("zone")
        
        if not all([phone, train_number, coach, zone]):
            flash("All fields are required", "danger")
            return redirect(url_for("standing_zone"))
        
        # Check if Trust ID exists
        trust_id = TrustID.query.filter_by(phone=phone).first()
        if not trust_id:
            flash("Trust ID not found for this phone number. Please create one first.", "warning")
            return redirect(url_for("trust_id"))
        
        # Generate QR code for standing zone
        zone_data = f"{train_number}|{coach}|{zone}|{phone}"
        qr_code = generate_qr_code(zone_data)
        
        # Create and save standing zone allocation
        new_zone = StandingZone(
            phone=phone,
            train_number=train_number,
            coach=coach,
            zone=zone,
            qr_code=qr_code,
            created_at=datetime.now(),
            status="valid"
        )
        db.session.add(new_zone)
        db.session.commit()
        
        flash("Standing zone QR code generated successfully", "success")
        return redirect(url_for("standing_zone", zone_id=new_zone.id))
    
    # GET request - display zone if ID provided, else form
    zone_id = request.args.get("zone_id")
    if zone_id:
        zone = StandingZone.query.get(zone_id)
        if zone:
            return render_template("standing_zone.html", zone=zone, qr_code=zone.qr_code)
    
    # Display all standing zones
    zones = StandingZone.query.order_by(StandingZone.created_at.desc()).all()
    return render_template("standing_zone.html", zones=zones)

# Seat Management routes
@app.route("/seat-management", methods=["GET", "POST"])
def seat_management():
    if request.method == "POST":
        coach = request.form.get("coach")
        seat_number = request.form.get("seat_number")
        status = request.form.get("status")
        phone = request.form.get("phone", "")
        
        if not all([coach, seat_number, status]):
            flash("Coach, seat number, and status are required", "danger")
            return redirect(url_for("seat_management"))
        
        # Find or create seat
        seat = Seat.query.filter_by(coach=coach, seat_number=seat_number).first()
        if seat:
            seat.status = status
            seat.phone = phone if status == "occupied" else ""
        else:
            seat = Seat(
                coach=coach,
                seat_number=seat_number,
                status=status,
                phone=phone if status == "occupied" else ""
            )
            db.session.add(seat)
        
        db.session.commit()
        flash("Seat status updated successfully", "success")
        return redirect(url_for("seat_management"))
    
    # GET request - display all seats
    seats = Seat.query.order_by(Seat.coach, Seat.seat_number).all()
    return render_template("seat_management.html", seats=seats)

# API Endpoints
@app.route("/api/verify-ticket", methods=["POST"])
def verify_ticket():
    data = request.json
    if not data or "ticket_data" not in data:
        return jsonify({"status": "error", "message": "No ticket data provided"}), 400
    
    ticket_data = data["ticket_data"]
    try:
        train_number, coach, seat, phone = ticket_data.split("|")
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid ticket format"}), 400
    
    # Check if ticket exists
    ticket = Ticket.query.filter_by(
        train_number=train_number,
        coach=coach,
        seat=seat,
        phone=phone,
        status="valid"
    ).first()
    
    if ticket:
        return jsonify({
            "status": "success",
            "valid": True,
            "ticket": {
                "train_number": train_number,
                "coach": coach,
                "seat": seat,
                "phone": phone[-4:].rjust(10, '*'),  # Mask phone number
                "created_at": ticket.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
        })
    else:
        return jsonify({"status": "success", "valid": False})

@app.route("/api/verify-standing-zone", methods=["POST"])
def verify_standing_zone():
    data = request.json
    if not data or "zone_data" not in data:
        return jsonify({"status": "error", "message": "No zone data provided"}), 400
    
    zone_data = data["zone_data"]
    try:
        train_number, coach, zone, phone = zone_data.split("|")
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid zone format"}), 400
    
    # Check if standing zone allocation exists
    zone_record = StandingZone.query.filter_by(
        train_number=train_number,
        coach=coach,
        zone=zone,
        phone=phone,
        status="valid"
    ).first()
    
    if zone_record:
        return jsonify({
            "status": "success",
            "valid": True,
            "zone": {
                "train_number": train_number,
                "coach": coach,
                "zone": zone,
                "phone": phone[-4:].rjust(10, '*'),  # Mask phone number
                "created_at": zone_record.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
        })
    else:
        return jsonify({"status": "success", "valid": False})

@app.route("/api/submit-complaint", methods=["POST"])
def submit_complaint():
    data = request.json
    if not data or "phone" not in data or "message" not in data:
        return jsonify({"status": "error", "message": "Phone and message are required"}), 400
    
    phone = data["phone"]
    message = data["message"]
    
    # Analyze complaint risk
    risk_level = analyze_complaint_risk(message)
    
    # Create and save complaint
    new_complaint = Complaint(
        phone=phone,
        message=message,
        timestamp=datetime.now(),
        risk_level=risk_level
    )
    db.session.add(new_complaint)
    db.session.commit()
    
    # Send confirmation SMS
    try:
        send_sms_notification(
            phone, 
            f"Your complaint has been registered. Risk level: {risk_level}. We'll take action accordingly."
        )
    except Exception as e:
        logger.error(f"SMS notification failed: {e}")
        return jsonify({
            "status": "warning",
            "message": "Complaint submitted but SMS notification failed",
            "complaint_id": new_complaint.id,
            "risk_level": risk_level
        })
    
    return jsonify({
        "status": "success",
        "message": "Complaint submitted successfully",
        "complaint_id": new_complaint.id,
        "risk_level": risk_level
    })

@app.route("/api/issue-fine", methods=["POST"])
def issue_fine():
    data = request.json
    if not data or "phone" not in data or "amount" not in data or "reason" not in data:
        return jsonify({"status": "error", "message": "Phone, amount, and reason are required"}), 400
    
    phone = data["phone"]
    amount = data["amount"]
    reason = data["reason"]
    
    # Create and save fine
    new_fine = Fine(
        phone=phone,
        amount=amount,
        reason=reason,
        timestamp=datetime.now(),
        status="issued",
        blockchain_hash=f"0x{os.urandom(16).hex()}"  # Mock blockchain hash
    )
    db.session.add(new_fine)
    db.session.commit()
    
    # Send fine notification
    try:
        send_sms_notification(
            phone, 
            f"A fine of Rs. {amount} has been issued to you for: {reason}. Fine ID: {new_fine.id}"
        )
    except Exception as e:
        logger.error(f"SMS notification failed: {e}")
    
    return jsonify({
        "status": "success",
        "message": "Fine issued successfully",
        "fine_id": new_fine.id
    })

# Main entry point
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
