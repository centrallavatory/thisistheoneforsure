from celery import Celery
import os
import time
import logging
import json
import requests
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("osint-worker")

# Create Celery instance
celery_app = Celery('osint_tasks')

# Configure Celery
celery_app.conf.broker_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
celery_app.conf.result_backend = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# Task registry
@celery_app.task(bind=True, name='tasks.email_scan')
def email_scan(self, email: str) -> Dict[str, Any]:
    """
    Scan an email address for information using multiple sources
    """
    logger.info(f"Starting email scan for: {email}")
    self.update_state(state='PROGRESS', meta={'progress': 10})
    
    results = {
        'email': email,
        'sources_checked': [],
        'breaches': [],
        'social_profiles': [],
        'domains': [],
        'confidence': 0
    }
    
    try:
        # Simulate email domain check
        self.update_state(state='PROGRESS', meta={'progress': 30})
        time.sleep(1)  # Simulate API call
        domain = email.split('@')[-1]
        results['domains'].append(domain)
        
        # Simulate breach database check 
        self.update_state(state='PROGRESS', meta={'progress': 50})
        time.sleep(2)  # Simulate API call
        # In production, use real API like HaveIBeenPwned
        results['breaches'] = _simulate_breach_results(email)
        results['sources_checked'].append('breach_database')
        
        # Simulate social profile check
        self.update_state(state='PROGRESS', meta={'progress': 80})
        time.sleep(1.5)  # Simulate API call
        results['social_profiles'] = _simulate_social_profile_results(email)
        results['sources_checked'].append('social_profiles')
        
        # Calculate confidence score based on findings
        total_findings = len(results['breaches']) + len(results['social_profiles'])
        results['confidence'] = min(95, 40 + total_findings * 10)
        
        self.update_state(state='PROGRESS', meta={'progress': 100})
        logger.info(f"Email scan completed for: {email}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error in email scan: {str(e)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(e)}
        )
        raise

@celery_app.task(bind=True, name='tasks.phone_scan')
def phone_scan(self, phone: str) -> Dict[str, Any]:
    """
    Scan a phone number for information using PhoneInfoga
    """
    logger.info(f"Starting phone scan for: {phone}")
    self.update_state(state='PROGRESS', meta={'progress': 10})
    
    results = {
        'phone': phone,
        'valid': False,
        'carrier': None,
        'country': None,
        'line_type': None,
        'location': None,
        'owner_details': {},
        'confidence': 0
    }
    
    try:
        # Simulate PhoneInfoga integration
        self.update_state(state='PROGRESS', meta={'progress': 40})
        time.sleep(2)  # Simulate API call
        
        # In production, call the PhoneInfoga API
        # Example: requests.get(f"http://phoneinfoga:5000/api/numbers/{phone}/scan")
        
        results.update(_simulate_phone_info(phone))
        
        # Calculate confidence score
        confidence = 0
        if results['valid']:
            confidence += 30
        if results['carrier']:
            confidence += 15
        if results['location']:
            confidence += 20
        if results['owner_details']:
            confidence += 25
            
        results['confidence'] = min(95, confidence)
        
        self.update_state(state='PROGRESS', meta={'progress': 100})
        logger.info(f"Phone scan completed for: {phone}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error in phone scan: {str(e)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(e)}
        )
        raise

@celery_app.task(bind=True, name='tasks.social_scan')
def social_scan(self, username: str) -> Dict[str, Any]:
    """
    Scan for username across various social media platforms
    """
    logger.info(f"Starting social media scan for: {username}")
    self.update_state(state='PROGRESS', meta={'progress': 10})
    
    results = {
        'username': username,
        'platforms_checked': [],
        'platforms_found': [],
        'platforms_not_found': [],
        'profiles': [],
        'confidence': 0
    }
    
    try:
        # List of platforms to check
        platforms = [
            'twitter', 'instagram', 'facebook', 'linkedin', 'github', 'reddit',
            'tiktok', 'pinterest', 'snapchat', 'youtube', 'twitch'
        ]
        
        results['platforms_checked'] = platforms
        
        # Simulate Sherlock/Social-Analyzer integration
        progress = 10
        step = int(80 / len(platforms))
        
        for platform in platforms:
            self.update_state(state='PROGRESS', meta={'progress': progress})
            time.sleep(0.3)  # Simulate API call
            
            # In production, use actual Sherlock or Social-Analyzer
            if _simulate_platform_check(username, platform):
                results['platforms_found'].append(platform)
                profile_url = f"https://{platform}.com/{username}"
                results['profiles'].append({
                    'platform': platform,
                    'url': profile_url,
                    'username': username
                })
            else:
                results['platforms_not_found'].append(platform)
                
            progress += step
        
        # Calculate confidence based on findings
        found_ratio = len(results['platforms_found']) / len(platforms)
        results['confidence'] = min(95, int(found_ratio * 100))
        
        self.update_state(state='PROGRESS', meta={'progress': 100})
        logger.info(f"Social scan completed for: {username}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error in social scan: {str(e)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(e)}
        )
        raise

@celery_app.task(bind=True, name='tasks.image_scan')
def image_scan(self, image_path: str) -> Dict[str, Any]:
    """
    Analyze an image for facial recognition and reverse image search
    """
    logger.info(f"Starting image scan for file: {image_path}")
    self.update_state(state='PROGRESS', meta={'progress': 10})
    
    results = {
        'image_path': image_path,
        'faces_detected': 0,
        'face_data': [],
        'reverse_matches': [],
        'metadata': {},
        'confidence': 0
    }
    
    try:
        # Simulate image metadata extraction
        self.update_state(state='PROGRESS', meta={'progress': 30})
        time.sleep(1)  # Simulate processing
        results['metadata'] = _simulate_image_metadata()
        
        # Simulate facial detection
        self.update_state(state='PROGRESS', meta={'progress': 50})
        time.sleep(2)  # Simulate processing
        face_results = _simulate_face_detection()
        results['faces_detected'] = face_results['count']
        results['face_data'] = face_results['data']
        
        # Simulate reverse image search
        self.update_state(state='PROGRESS', meta={'progress': 80})
        time.sleep(3)  # Simulate API call
        results['reverse_matches'] = _simulate_reverse_image_search()
        
        # Calculate confidence score
        confidence = 0
        if results['faces_detected'] > 0:
            confidence += 40
        if results['metadata']:
            confidence += 20
        if results['reverse_matches']:
            confidence += 30 * min(1, len(results['reverse_matches']) / 5)
            
        results['confidence'] = min(95, int(confidence))
        
        self.update_state(state='PROGRESS', meta={'progress': 100})
        logger.info(f"Image scan completed for file: {image_path}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error in image scan: {str(e)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(e)}
        )
        raise

# Helper functions for mocking data
def _simulate_breach_results(email: str) -> List[Dict[str, Any]]:
    # In production, replace with real API calls
    return [
        {
            'name': 'ExampleBreachA',
            'date': '2021-06-15',
            'data_classes': ['emails', 'passwords', 'usernames']
        },
        {
            'name': 'ExampleBreachB',
            'date': '2020-03-22',
            'data_classes': ['emails', 'ip_addresses']
        }
    ]

def _simulate_social_profile_results(email: str) -> List[Dict[str, Any]]:
    # In production, replace with real API calls
    username = email.split('@')[0]
    return [
        {
            'platform': 'LinkedIn',
            'url': f'https://linkedin.com/in/{username}',
            'match_confidence': 85
        },
        {
            'platform': 'Twitter',
            'url': f'https://twitter.com/{username}',
            'match_confidence': 72
        }
    ]

def _simulate_phone_info(phone: str) -> Dict[str, Any]:
    # In production, replace with real API calls
    return {
        'valid': True,
        'carrier': 'Verizon Wireless',
        'country': 'United States',
        'line_type': 'Mobile',
        'location': 'New York, NY',
        'owner_details': {
            'name': None,  # Privacy laws often prevent this
            'age_range': '30-40',
            'associated_emails': 1
        }
    }

def _simulate_platform_check(username: str, platform: str) -> bool:
    # In production, replace with real API calls
    # Randomly determine if username exists on platform (70% chance for demo)
    import random
    return random.random() < 0.7

def _simulate_image_metadata() -> Dict[str, Any]:
    # In production, extract real metadata from image
    return {
        'camera': 'iPhone 13 Pro',
        'date_taken': '2023-09-15T14:30:22',
        'location': {
            'latitude': 40.7128,
            'longitude': -74.0060
        },
        'dimensions': '3024x4032',
        'has_been_edited': True
    }

def _simulate_face_detection() -> Dict[str, Any]:
    # In production, use real facial recognition
    return {
        'count': 1,
        'data': [
            {
                'confidence': 0.92,
                'age_estimate': '30-35',
                'gender': 'male',
                'facial_features': {
                    'eyes': 'brown',
                    'hair': 'brown',
                    'facial_hair': 'beard'
                }
            }
        ]
    }

def _simulate_reverse_image_search() -> List[Dict[str, Any]]:
    # In production, use real reverse image search API
    return [
        {
            'url': 'https://example.com/profile1.jpg',
            'source': 'Facebook',
            'similarity': 0.88
        },
        {
            'url': 'https://example.com/profile2.jpg',
            'source': 'Twitter',
            'similarity': 0.75
        },
        {
            'url': 'https://example.com/profile3.jpg',
            'source': 'Instagram',
            'similarity': 0.67
        }
    ]

if __name__ == '__main__':
    celery_app.start()