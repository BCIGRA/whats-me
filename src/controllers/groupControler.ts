import { Request, Response } from 'express';
import { SessionClient } from '../services/sessionClient';
import { GroupChat } from 'whatsapp-web.js';

export class GroupController {
    static async createGroup(req: Request, res: Response): Promise<void> {
        try {
            const { sessionID, groupName, participants } = req.body;

            const client = SessionClient.getClient(sessionID);
            if (!client) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }

            const whatsappClient = client.getWhatsAppClient();
            const group = await whatsappClient.createGroup(groupName, participants);
            res.status(201).json({ message: 'Group created', group });
        } catch (error) {
            console.error('Error creating group:', error);
            res.status(500).json({ message: 'Failed to create group', error });
        }
    }

    static async addParticipants(req: Request, res: Response): Promise<void> {
        try {
            const { sessionID, groupID, participants } = req.body;

            const client = SessionClient.getClient(sessionID);
            if (!client) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }

            const groupChat = await client.getGroupChat(groupID);
            if (!groupChat) {
                res.status(404).json({ message: 'Group chat not found' });
                return;
            }

            await groupChat.addParticipants(participants);
            res.status(200).json({ message: 'Participants added' });
        } catch (error) {
            console.error('Error adding participants:', error);
            res.status(500).json({ message: 'Failed to add participants', error });
        }
    }

    static async removeParticipants(req: Request, res: Response): Promise<void> {
        try {
            const { sessionID, groupID, participants } = req.body;

            const client = SessionClient.getClient(sessionID);
            if (!client) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }

            const groupChat = await client.getGroupChat(groupID);
            if (!groupChat) {
                res.status(404).json({ message: 'Group chat not found' });
                return;
            }

            await groupChat.removeParticipants(participants);
            res.status(200).json({ message: 'Participants removed' });
        } catch (error) {
            console.error('Error removing participants:', error);
            res.status(500).json({ message: 'Failed to remove participants', error });
        }
    }

    static async leaveGroup(req: Request, res: Response): Promise<void> {
        try {
            const { sessionID, groupID } = req.body;

            const client = SessionClient.getClient(sessionID);
            if (!client) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }

            const groupChat = await client.getGroupChat(groupID);
            if (!groupChat) {
                res.status(404).json({ message: 'Group chat not found' });
                return;
            }

            await groupChat.leave();
            res.status(200).json({ message: 'Left the group' });
        } catch (error) {
            console.error('Error leaving group:', error);
            res.status(500).json({ message: 'Failed to leave group', error });
        }
    }

    static async getContact(req: Request, res: Response): Promise<void> {
        try {
            const { sessionID, groupID, contactID } = req.body;

            const client = SessionClient.getClient(sessionID);
            if (!client) {
                res.status(404).json({ message: 'Session not found' });
                return;
            }

            const groupChat = await client.getGroupChat(groupID);
            if (!groupChat) {
                res.status(404).json({ message: 'Group chat not found' });
                return;
            }

            const members = await groupChat.getContact();

            if (members) {
                res.status(200).json({ members });
            } else {
                res.status(404).json({ message: 'Contact not found' });
            }
        } catch (error) {
            console.error('Error getting contact:', error);
            res.status(500).json({ message: 'Failed to get contact', error });
        }
    }
}
