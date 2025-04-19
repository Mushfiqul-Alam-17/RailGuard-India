import os
import hashlib
import time
import logging
import json
from web3 import Web3

logger = logging.getLogger(__name__)

# For simplicity, we'll use a mock IPFS CID generator
def generate_mock_ipfs_cid(data):
    """Generate a mock IPFS CID for demonstration purposes"""
    # In production, this would be an actual IPFS connection
    hash_obj = hashlib.sha256(data.encode('utf-8'))
    return f"Qm{hash_obj.hexdigest()[:44]}"

def create_trust_id(phone, aadhaar=""):
    """
    Create a Trust ID using blockchain principles
    
    Args:
        phone (str): Phone number
        aadhaar (str, optional): Aadhaar number (masked/encrypted)
        
    Returns:
        tuple: (tid_hash, ipfs_cid)
    """
    try:
        # Create a unique seed from phone and optional Aadhaar
        # In production, Aadhaar should be properly encrypted/hashed
        if aadhaar:
            # Only store last 4 digits, hash the rest for privacy
            aadhaar_masked = f"xxxx-xxxx-{aadhaar[-4:]}"
            aadhaar_hash = hashlib.sha256(aadhaar.encode('utf-8')).hexdigest()
        else:
            aadhaar_masked = None
            aadhaar_hash = None
        
        # Create timestamp
        timestamp = int(time.time())
        
        # Create Trust ID data
        trust_id_data = {
            "phone": phone,
            "aadhaar_hash": aadhaar_hash,
            "timestamp": timestamp,
            "version": "1.0"
        }
        
        # Generate Trust ID hash
        trust_id_json = json.dumps(trust_id_data, sort_keys=True)
        tid_hash = hashlib.sha256(trust_id_json.encode('utf-8')).hexdigest()
        
        # Store on IPFS (mocked for now)
        ipfs_data = {
            "tid_hash": tid_hash,
            "timestamp": timestamp,
            "aadhaar_masked": aadhaar_masked,
            "version": "1.0"
        }
        ipfs_cid = generate_mock_ipfs_cid(json.dumps(ipfs_data))
        
        logger.info(f"Created Trust ID: {tid_hash[:8]}... with IPFS CID: {ipfs_cid}")
        return tid_hash, ipfs_cid
    
    except Exception as e:
        logger.error(f"Error creating Trust ID: {str(e)}")
        raise

def verify_trust_id(tid_hash, ipfs_cid):
    """
    Verify a Trust ID using blockchain
    
    Args:
        tid_hash (str): Trust ID hash
        ipfs_cid (str): IPFS CID
        
    Returns:
        bool: True if verified, False otherwise
    """
    # This is a mock verification
    # In production, this would verify on the actual blockchain
    return ipfs_cid.startswith("Qm") and len(tid_hash) == 64

def log_transaction_to_blockchain(transaction_type, data):
    """
    Log a transaction to blockchain
    
    Args:
        transaction_type (str): Type of transaction
        data (dict): Transaction data
        
    Returns:
        str: Transaction hash
    """
    # Mock blockchain transaction
    # In production, this would interact with Ethereum/Web3
    transaction = {
        "type": transaction_type,
        "data": data,
        "timestamp": int(time.time())
    }
    
    # Generate transaction hash
    tx_json = json.dumps(transaction, sort_keys=True)
    tx_hash = f"0x{hashlib.sha256(tx_json.encode('utf-8')).hexdigest()}"
    
    logger.info(f"Logged {transaction_type} transaction: {tx_hash[:10]}...")
    return tx_hash
